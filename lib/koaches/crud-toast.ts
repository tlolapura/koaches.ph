export const crudToast = {
  created: (label: string, name?: string) => (name ? `"${name}" created` : `${label} created`),
  updated: (label: string) => `${label} updated`,
  deleted: (label: string) => `${label} deleted`,
  saved: (label: string) => `${label} saved`,
  failed: (action: string) => `Couldn't ${action}. Try again.`,
};
