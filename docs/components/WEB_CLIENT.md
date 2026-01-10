# 🎨 Arquitectura Frontend: Formularios y Validación (V2)

Este documento detalla la evolución y el estándar actual para el manejo de formularios en el cliente de CrystalTides.

## 🔄 Evolución del Código

Inicialmente, el proyecto utilizaba un manejo de formularios manual v1:

- Estado con `useState` para cada campo.
- Validación manual con `if/else` dentro de los handlers `onSubmit`.
- Tipado débil (`any`) o implícito en muchos casos.

**Actualidad (V2):**
Hemos migrado los formularios críticos a una arquitectura robusta basada en librerías estándar de la industria.

## 🛠️ Stack Tecnológico

| Librería                | Propósito                            | Beneficio                                                                  |
| :---------------------- | :----------------------------------- | :------------------------------------------------------------------------- |
| **react-hook-form**     | Manejo de estado del formulario      | Reduce re-renders, mejora performance y simplifica el código boiler-plate. |
| **zod**                 | Definición de esquemas de validación | Validación estricta, re-utilizable y segura.                               |
| **@hookform/resolvers** | Conexión RHF + Zod                   | Permite usar esquemas Zod directamente en los hooks de RHF.                |

## 🏗️ Patrón de Diseño

Todos los formularios nuevos o refactorizados deben seguir este patrón:

### 1. Definir Schema (`src/schemas/`)

Creamos un archivo de definición en [`client/src/schemas/`](../client/src/schemas/) que espeje, en lo posible, la validación del servidor.

```typescript
// src/schemas/ejemplo.ts
import { z } from "zod";

export const ejemploSchema = z.object({
  titulo: z.string().min(5, "Muy corto"),
  email: z.string().email("Email inválido"),
  tipo: z.enum(["A", "B"]),
});

export type EjemploValues = z.infer<typeof ejemploSchema>;
```

### 2. Implementar Componente

Uso del hook `useForm` con `zodResolver`.

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ejemploSchema, EjemploValues } from "../schemas/ejemplo";

export function EjemploForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EjemploValues>({
    resolver: zodResolver(ejemploSchema),
  });

  const onSubmit = (data: EjemploValues) => {
    // 'data' está 100% tipada y validada
    api.send(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("titulo")} />
      {errors.titulo && <span>{errors.titulo.message}</span>}
      <button type="submit">Enviar</button>
    </form>
  );
}
```

## 📝 Módulos Refactorizados

Los siguientes módulos ya operan bajo este estándar V2:

1.  **Soporte (Tickets)**:
    - [Creación de Tickets](../client/src/components/Support/TicketForm.tsx) (Ejemplo V2: [`useForm + Zod`](../client/src/components/Support/TicketForm.tsx#L22)).
    - Respuestas (Replies).
2.  **Perfil de Usuario (Account)**:
    - Edición de Bio.
    - Redes Sociales (Discord, Twitter, etc).
3.  **Sugerencias**:
    - Formulario de envío con tipos estrictos (Bug, Mod, General, etc).
    - Prevención de envíos vacíos o duplicados.

## 🚀 Próximos Pasos

4.  **Autenticación**:
    - Login: Validación de email/password (`loginSchema`).
    - Register: Validación de coincidencia de contraseñas y unicidad (`registerSchema`).

## 🚀 Próximos Pasos

5.  **Panel Admin**:
    - NewsForm: Gestión completa de noticias con validación y traducción.

## 🚀 Próximos Pasos

- Mantener la consistencia en nuevos formularios que se creen en el futuro.
- Considerar migrar formularios menores si surgen problemas de mantenimiento.
