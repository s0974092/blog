interface Window {
  chatbase: ((command: string, options: { token: string }) => void) | undefined;
}
