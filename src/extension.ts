'use strict';

import * as path from 'path';
import { workspace, ExtensionContext, commands, window } from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
  RevealOutputChannelOn,
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  // The server is implemented in node
  const serverModule = context.asAbsolutePath(path.join('out', 'server.js'));
  // The debug options for the server
  const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for plain text documents
    documentSelector: [{ scheme: 'file', language: 'fusion' }],
    synchronize: {
      // Synchronize the setting section 'neosFusion' to the server
      configurationSection: 'neosFusion',
      // Notify the server about file changes to '.clientrc files contain in the workspace
      fileEvents: workspace.createFileSystemWatcher('**/.clientrc'),
    },
    revealOutputChannelOn: RevealOutputChannelOn.Info,
  };

  // activate TailwindCSS for Fusion files, so that autocompletion
  // for Tailwind CSS works properly
  const tailwindCssConfig = workspace.getConfiguration('tailwindCSS');
  let includeLanguagesConfig: any =
    tailwindCssConfig.get('includeLanguages') || {};
  if (includeLanguagesConfig['fusion'] !== 'html') {
    includeLanguagesConfig['fusion'] = 'html';
    tailwindCssConfig.update('includeLanguages', includeLanguagesConfig, true);
  }

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "neos-fusion" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = commands.registerCommand('extension.sayHello', () => {
    // The code you place here will be executed every time your command is executed

    // Display a message box to the user
    window.showInformationMessage('Hello World!');
  });

  context.subscriptions.push(disposable);

  // Create the language client and start the client.
  client = new LanguageClient(
    'neosFusion',
    'Fusion Language Server',
    serverOptions,
    clientOptions
  );

  // Start the client. This will also launch the server
  client.start();
}

// this method is called when your extension is deactivated
export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
