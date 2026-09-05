import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js'
import { CohereClient } from 'cohere-ai'
import dotenv from 'dotenv'

// Proteger stdout para protocolo estricto MCP JSON-RPC
console.log = (...args: unknown[]) => console.error(...args)

dotenv.config()

const cohereApiKey = process.env.COHERE_API_KEY || ''
const cohere = new CohereClient({ token: cohereApiKey })

const RERANK_TOOL: Tool = {
  name: 'cohere_rerank',
  description: 'Re-ordena una lista de documentos candidatos según su relevancia semántica para una consulta usando Cohere Rerank API (v3.5).',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'La consulta o pregunta del usuario.'
      },
      documents: {
        type: 'array',
        items: { type: 'string' },
        description: 'Lista de cadenas de texto o fragmentos a reordenar.'
      },
      topN: {
        type: 'number',
        description: 'Número de documentos top a devolver. Por defecto 3.'
      },
      model: {
        type: 'string',
        description: 'Modelo de rerank a utilizar (ej: rerank-v3.5, rerank-multilingual-v3.0). Por defecto rerank-v3.5.'
      }
    },
    required: ['query', 'documents']
  }
}

const EMBED_TOOL: Tool = {
  name: 'cohere_embed',
  description: 'Genera embeddings vectoriales semánticos para un array de textos usando Cohere Embed API.',
  inputSchema: {
    type: 'object',
    properties: {
      texts: {
        type: 'array',
        items: { type: 'string' },
        description: 'Textos a vectorizar.'
      },
      inputType: {
        type: 'string',
        description: 'Tipo de entrada: search_document, search_query, classification, clustering. Por defecto search_document.'
      }
    },
    required: ['texts']
  }
}

const CHAT_TOOL: Tool = {
  name: 'cohere_chat',
  description: 'Ejecuta una consulta de chat o completado con el modelo Command R+ de Cohere.',
  inputSchema: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        description: 'El mensaje del usuario para la IA.'
      },
      model: {
        type: 'string',
        description: 'Modelo de Cohere (ej: command-r-plus, command-r). Por defecto command-r-plus.'
      }
    },
    required: ['message']
  }
}

async function handleRerank(args: Record<string, unknown>) {
  const query = typeof args.query === 'string' ? args.query : ''
  const documents = Array.isArray(args.documents) ? (args.documents as string[]) : []
  const topN = typeof args.topN === 'number' ? args.topN : 3
  const model = typeof args.model === 'string' ? args.model : 'rerank-v3.5'

  const response = await cohere.v2.rerank({
    model,
    query,
    documents,
    topN
  })

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(response, null, 2)
      }
    ]
  }
}

async function handleEmbed(args: Record<string, unknown>) {
  const texts = Array.isArray(args.texts) ? (args.texts as string[]) : []
  const inputType = (typeof args.inputType === 'string' ? args.inputType : 'search_document') as 'search_document' | 'search_query' | 'classification' | 'clustering'

  const response = await cohere.embed({
    texts,
    model: 'embed-multilingual-v3.0',
    inputType
  })

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(response, null, 2)
      }
    ]
  }
}

async function handleChat(args: Record<string, unknown>) {
  const message = typeof args.message === 'string' ? args.message : ''
  const model = typeof args.model === 'string' ? args.model : 'command-r-plus'

  const response = await cohere.chat({
    model,
    message
  })

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(response.text, null, 2)
      }
    ]
  }
}

const server = new Server(
  {
    name: 'cohere-mcp-server',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
)

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [RERANK_TOOL, EMBED_TOOL, CHAT_TOOL]
  }
})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: rawArgs } = request.params
  const args = rawArgs && typeof rawArgs === 'object' ? (rawArgs as Record<string, unknown>) : {}

  if (!cohereApiKey) {
    throw new Error('COHERE_API_KEY no encontrada en las variables de entorno.')
  }

  switch (name) {
    case 'cohere_rerank':
      return handleRerank(args)
    case 'cohere_embed':
      return handleEmbed(args)
    case 'cohere_chat':
      return handleChat(args)
    default:
      throw new Error(`Herramienta no encontrada: ${name}`)
  }
})

try {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('🚀 Servidor MCP de Cohere escuchando en STDIO.')
} catch (err) {
  console.error('❌ Error fatal en el Servidor MCP de Cohere:', err)
  process.exit(1)
}
