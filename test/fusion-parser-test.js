const expect = require('chai').expect;
const fusionParser = require('../src/fusion-parser');

describe('parser', () => {
  it('parses a single declaration', () => {
    const tree = fusionParser.parse(`foo.bar = "Test"`);
    expect(tree).to.have.property('foo');
    expect(tree.foo).to.have.property('bar');
  });

  it('parses multiple declarations', () => {
    const tree = fusionParser.parse(`
      foo = "Test"
      'foo' {
        @process.answer = 42
      }
    `);
    expect(tree).to.have.property('foo');
    expect(tree.foo).to.have.property('__value');
    expect(tree.foo).to.have.property('@process');
  });

  it('parses a first level prototype', () => {
    const tree = fusionParser.parse(`
      prototype(My.Package:Object.Name) {
        @class = 'My\\\\Implementation\\\\Class'
      }
    `);
    expect(tree).to.have.property('__prototypes');
    expect(tree['__prototypes']).to.have.property('My.Package:Object.Name');
    expect(tree['__prototypes']['My.Package:Object.Name']).to.have.property('@class');
  });

  it('parses nested prototypes', () => {
    const tree = fusionParser.parse(`
      prototype(My.Package:Object.Name) {
        prototype(My.Package:Other.Object) {
          @if.notEmpty = true
        }
      }
    `);
    expect(tree).to.deep.equal({
      __prototypes: {
        "My.Package:Object.Name": {
          __prototypes: {
            "My.Package:Other.Object": {
              "@if": {
                notEmpty: {
                  __value: true
                }
              }
            }
          }
        }
      }
    });
  });

  it('parses includes', () => {
    const tree = fusionParser.parse(`
      include: My/Custom/Object.fusion
      foo = "bar"
      include: 'Another/Custom/Object.fusion'
    `);
    expect(tree).to.deep.equal({
      __includes: {
        'My/Custom/Object.fusion': {},
        'Another/Custom/Object.fusion': {}
      },
      foo: {
        __value: 'bar'
      }
    });
  });

  it('parses complex Fusion', () => {
    const output = fusionParser.parse(`
      /*
       * From the Neos default rendering
       */

      include: Prototypes/ContentCase.fusion
      include: Prototypes/Document.fusion
      include: Prototypes/Content.fusion
      include: Prototypes/ContentComponent.fusion
      include: Prototypes/PrimaryContent.fusion
      include: Prototypes/ContentCollection.fusion
      include: Prototypes/Page.fusion
      include: Prototypes/Shortcut.fusion
      include: Prototypes/BreadcrumbMenu.fusion
      include: Prototypes/DimensionsMenu.fusion
      include: Prototypes/Menu.fusion
      include: Prototypes/Plugin.fusion
      include: Prototypes/PluginView.fusion
      include: Prototypes/ConvertUris.fusion
      include: Prototypes/ConvertNodeUris.fusion
      include: Prototypes/DocumentMetadata.fusion
      include: Prototypes/Editable.fusion
      include: Prototypes/ContentElementWrapping.fusion
      include: Prototypes/ContentElementEditable.fusion
      include: Prototypes/NodeUri.fusion
      include: Prototypes/ImageUri.fusion
      include: Prototypes/FallbackNode.fusion

      # The root matcher used to start rendering in Neos
      #
      # The default is to use a render path of "page", unless the requested format is not "html"
      # in which case the format string will be used as the render path (with dots replaced by slashes)
      #
      root = Neos.Fusion:Case
      root {
        shortcut {
          prototype(Neos.Neos:Page) {
            body = Neos.Neos:Shortcut
          }

          @position = 'start'
          condition = \${q(node).is('[instanceof Neos.Neos:Shortcut]')}
          type = 'Neos.Neos:Page'
        }

        editPreviewMode {
          @position = 'end 9996'
          possibleEditPreviewModePath = \${documentNode.context.currentRenderingMode.fusionPath}
          condition = \${documentNode.context.inBackend && this.possibleEditPreviewModePath != null && this.possibleEditPreviewModePath != ''}
          renderPath = \${'/' + this.possibleEditPreviewModePath}
        }

        layout {
          @position = 'end 9997'
          layout = \${q(node).property('layout') != null && q(node).property('layout') != '' ? q(node).property('layout') : q(node).parents('[subpageLayout][subpageLayout != ""]').first().property('subpageLayout')}
          condition = \${this.layout != null && this.layout != ''}
          renderPath = \${'/' + this.layout}
        }

        format {
          @position = 'end 9998'
          condition = \${request.format != 'html'}
          renderPath = \${'/' + String.replace(request.format, '.', '/')}
        }

        default {
          @position = 'end 9999'
          condition = TRUE
          renderPath = '/page'
        }

        @cache {
          mode = 'cached'

          entryIdentifier {
            node = \${node}
          }
          entryTags {
            # Whenever the node changes the matched condition could change
            1 = \${'Node_' + documentNode.identifier}
            # Whenever one of the parent nodes changes the layout could change
            2 = \${Neos.Caching.nodeTag(q(documentNode).parents())}
          }
        }

        # Catch all unhandled exceptions at the root
        @exceptionHandler = 'Neos\\Neos\\Fusion\\ExceptionHandlers\\PageHandler'
      }

      # Extension of the GlobalCacheIdentifiers prototype
      #
      # We add the names of workspaces of the current workspace chain (for example, "user-john,some-workspace,live") to the list
      # of entry identifier pieces in order to make sure that a specific combination of workspaces has its own content cache entry.
      #
      prototype(Neos.Fusion:GlobalCacheIdentifiers) {
        workspaceChain = \${documentNode.context.workspace.name + ',' + Array.join(Array.keys(documentNode.context.workspace.baseWorkspaces), ',')}
        editPreviewMode = \${documentNode.context.currentRenderingMode.name}
      }
    `)
  });
});