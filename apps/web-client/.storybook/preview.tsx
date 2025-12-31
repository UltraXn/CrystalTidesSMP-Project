import type { Preview } from "@storybook/react";
import '../src/index.css'; // Import ALL global styles including variables, base, layout, etc.
import { BrowserRouter } from 'react-router-dom';
import React, { Suspense } from 'react';
import '../src/i18n'; // Initialize i18next

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'void',
      values: [
        { name: 'void', value: '#0B0C10' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <Suspense fallback={<div className="p-10 text-white">Loading translations...</div>}>
        <BrowserRouter>
           <div className="bg-[#0B0C10] min-h-screen text-white font-inter">
              <Story />
           </div>
        </BrowserRouter>
      </Suspense>
    ),
  ],
};

export default preview;
