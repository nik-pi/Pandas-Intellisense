import * as vscode from 'vscode';
import * as path from 'path';
import { spawn } from 'child_process';

let dataframeColumns: Record<string, string[]> = {};

export function activate(context: vscode.ExtensionContext) {
    console.log('Pandas IntelliSense extension is now active.');

    // Register the "Update Columns" command
    let disposable = vscode.commands.registerCommand('pandas-intellisense.updateColumns', async () => {
        vscode.window.showInformationMessage('Updating DataFrame columns...');
        
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        
        const code = editor.document.getText();
        await updateDataframeColumns(code);

        vscode.window.showInformationMessage('DataFrame columns updated!');
        
        // Forcing IntelliSense refresh
        await vscode.commands.executeCommand('editor.action.triggerSuggest');
    });

    context.subscriptions.push(disposable);

    // Register completion provider for Python
    const provider = vscode.languages.registerCompletionItemProvider(
        'python',
        {
            provideCompletionItems(
                document: vscode.TextDocument, 
                position: vscode.Position, 
                token: vscode.CancellationToken, 
                context: vscode.CompletionContext
            ): vscode.CompletionItem[] {
            
                const lineText: string = document.lineAt(position).text;
                const prefix: string = lineText.substring(0, position.character);
            
                // Extract the DataFrame variable name before `["` or `['`
                const match: RegExpMatchArray | null = prefix.match(/(\w+)\s*\[\s*["']$/);
                if (!match) {
                    return [];
                }
            
                const dfName: string = match[1]; // Extracted DataFrame name
            
                if (!dataframeColumns[dfName]) {
                    return [];
                }
            
                return dataframeColumns[dfName].map((column: string) => {
                    return new vscode.CompletionItem(column, vscode.CompletionItemKind.Variable);
                });
            }
        },
        '"', "'"
    );

    context.subscriptions.push(provider);
}

export function deactivate() {
    console.log('Pandas IntelliSense extension is now deactivated.');
}

/**
 * Updates dataframeColumns by executing the Python script and waiting for completion.
 */
async function updateDataframeColumns(code: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const pythonScript = path.join(__dirname, '..', 'python', 'pandas_helper.py');
        const pythonProcess = spawn('python', [pythonScript]);

        let outputData = '';

        pythonProcess.stdin.write(code);
        pythonProcess.stdin.end();

        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });

        pythonProcess.stdout.on('end', () => {
            try {
                dataframeColumns = JSON.parse(outputData);

                // Force IntelliSense refresh AFTER updating columns
                vscode.commands.executeCommand('editor.action.triggerSuggest');
                resolve();
            } catch (error) {
                vscode.window.showErrorMessage('Error parsing DataFrame columns');
                reject(error);
            }
        });

        pythonProcess.stderr.on('data', (data) => {
            vscode.window.showErrorMessage(`Python error: ${data.toString()}`);
            reject(new Error(data.toString()));
        });
    });
}
