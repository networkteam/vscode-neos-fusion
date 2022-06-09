# Neos Fusion Language support

This extension adds language support for Fusion for [Neos CMS](https://www.neos.io/) projects.

## Features

* Basic syntax highlighting for Fusion
* [AFX](https://github.com/neos/fusion-afx) Syntax support
* Code-Snippets for Fusion-Objects

## Release Notes

### 2.0.0

* Support for Tailwind CSS, and proper HTML support in AFX blocks
    - before, this was done via a custom HTML syntax definition.
    - now, we are re-using the default HTML syntax, as explained in [Embedded Languages](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide#embedded-languages)
    - Additionally, inside `extension.ts`, we automatically configure the [Tailwind CSS](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) extension setting `tailwindCSS.includeLanguages` to include Fusion. This way, TailwindCSS IntelliSense works for AFX.
    - Finally, we use `injections` in `fusion.tmLanguage.fusion` to inject the {....} syntax into the HTML grammar.
### 1.0.6

* Add new fusion objects to code snippets
* Security update to fix vulnerable dependencies

### 1.0.5

Security update to fix vulnerable dependencies

### 1.0.4

Security update to fix vulnerable dependencies

### 1.0.3

Better AFX highlighting with custom XML grammar

### 1.0.2

Icon added

### 1.0.1

Better syntax highlighting for paths and Fusion literals

### 1.0.0

Initial release of neos-fusion

## Development

- make sure to use node >= 16
- run `npm install && npm run compile`
- Open this folder in Visual Studio Code
- then, inside "Run" in the menu, press "start debugging"

for further hints, see [vsc-extension-quickstart.md](vsc-extension-quickstart.md)