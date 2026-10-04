import type { CategoryConfig, SectionMeta } from '../types';

/** Every page the popup lists. `options[0]` must be the tab the site opens on by itself. */
export const categories: CategoryConfig[] = [
  {
    id: 'general-home',
    section: 'general',
    name: 'Home',
    uiVersion: 'v8',
    urlPattern: '/home',
    options: [
      { id: 'apps', label: 'Apps' },
      { id: 'plans', label: 'Plans' },
      { id: 'solutions', label: 'Solutions' },
    ],
  },
  {
    id: 'general-plans',
    section: 'general',
    name: 'Plans',
    uiVersion: 'v8',
    urlPattern: '/plans',
    options: [
      { id: 'my-plans', label: 'My plans' },
      { id: 'shared-with-me', label: 'Shared with me' },
      { id: 'all', label: 'All' },
    ],
  },
  {
    id: 'general-apps',
    section: 'general',
    name: 'Apps',
    uiVersion: 'v8',
    urlPattern: '/apps',
    options: [
      { id: 'my-apps', label: 'My apps' },
      { id: 'shared-with-me', label: 'Shared with me' },
      { id: 'all', label: 'All' },
    ],
  },
  {
    id: 'general-solutions',
    section: 'general',
    name: 'Solutions',
    uiVersion: 'v8',
    urlPattern: '/solutions',
    options: [
      { id: 'unmanaged', label: 'Unmanaged' },
      { id: 'managed', label: 'Managed' },
      { id: 'all', label: 'All' },
    ],
  },
  {
    id: 'general-websites',
    section: 'general',
    name: 'Websites',
    uiVersion: 'v8',
    urlPattern: '/websites',
    options: [
      { id: 'my-websites', label: 'My websites' },
      { id: 'shared-with-me', label: 'Shared with me' },
      { id: 'all', label: 'All' },
    ],
  },

  {
    id: 'data-tables',
    section: 'data',
    name: 'Tables',
    uiVersion: 'v8',
    urlPattern: '/entities',
    options: [
      { id: 'recommended', label: 'Recommended' },
      { id: 'custom', label: 'Custom' },
      { id: 'all', label: 'All' },
    ],
  },
  {
    id: 'data-columns',
    section: 'data',
    name: 'Columns',
    uiVersion: 'v8',
    urlPattern: '/entities/*/fields',
    options: [
      { id: 'custom-columns', label: 'Custom columns' },
      { id: 'system-columns', label: 'System columns' },
      { id: 'all-columns', label: 'All columns' },
    ],
  },
  {
    id: 'data-link-data',
    section: 'data',
    name: 'Link data',
    uiVersion: 'v9',
    urlPattern: '/linkdata',
    options: [
      { id: 'fabric-links', label: 'Fabric Links' },
      { id: 'other-links', label: 'Other Links' },
    ],
  },

  {
    id: 'ai-hub',
    section: 'ai',
    name: 'AI hub',
    uiVersion: 'v8',
    urlPattern: '/aibuilder/hub',
    options: [
      { id: 'my-ai-capabilities', label: 'My AI capabilities' },
      { id: 'prompts', label: 'Prompts' },
      { id: 'ai-models', label: 'AI models' },
    ],
  },
  {
    id: 'ai-agents',
    section: 'ai',
    name: 'Agents',
    uiVersion: 'v8',
    urlPattern: '/bot/list',
    options: [
      { id: 'my-agents', label: 'My agents' },
      { id: 'created-from-an-app', label: 'Created from an app' },
      { id: 'all', label: 'All' },
    ],
  },
  {
    id: 'ai-prompts',
    section: 'ai',
    name: 'Prompts',
    uiVersion: 'v9',
    urlPattern: '/aibuilder/prompts',
    options: [
      { id: 'my-prompts', label: 'My prompts' },
      { id: 'shared-with-me', label: 'Shared with me' },
      { id: 'all-prompts', label: 'All prompts' },
    ],
  },
  {
    id: 'ai-models',
    section: 'ai',
    name: 'AI models',
    uiVersion: 'v8',
    urlPattern: '/aibuilder/models',
    options: [
      { id: 'my-models', label: 'My models' },
      { id: 'shared-with-me', label: 'Shared with me' },
      { id: 'all-models', label: 'All models' },
    ],
  },
];

export const sections: SectionMeta[] = [
  { id: 'general', label: 'General' },
  { id: 'data', label: 'Data' },
  { id: 'ai', label: 'AI' },
];
