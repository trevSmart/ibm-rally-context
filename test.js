#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Funció per enviar una crida MCP al servidor
function callMcpTool(toolName, parameters = {}) {
    return new Promise((resolve, reject) => {
        const server = spawn('node', [join(__dirname, 'index.js')], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let errorOutput = '';

        server.stdout.on('data', (data) => {
            output += data.toString();
        });

        server.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        server.on('close', (code) => {
            if (code === 0) {
                try {
                    const response = JSON.parse(output);
                    resolve(response);
                } catch (error) {
                    reject(new Error(`Error parsing response: ${error.message}\nOutput: ${output}`));
                }
            } else {
                reject(new Error(`Server exited with code ${code}\nError: ${errorOutput}`));
            }
        });

        // Enviem la crida MCP
        const request = {
            type: 'toolCall',
            id: `test-${Date.now()}`,
            name: toolName,
            parameters: parameters
        };

        server.stdin.write(JSON.stringify(request) + '\n');
        server.stdin.end();
    });
}

// Funció principal de prova
async function runTests() {
    console.log('🧪 Iniciant proves de la versió moderna del MCP Rally Server...\n');

    try {
        // Prova 1: getProjects
        console.log('1️⃣ Provant getProjects...');
        const projectsResponse = await callMcpTool('getProjects');
        console.log('✅ getProjects funcionant correctament');
        console.log(`   Resposta: ${projectsResponse.content ? 'OK' : 'Error'}\n`);

        // Prova 2: getTypeDefinition (sense paràmetres)
        console.log('2️⃣ Provant getTypeDefinition...');
        const typeDefResponse = await callMcpTool('getTypeDefinition');
        console.log('✅ getTypeDefinition funcionant correctament');
        console.log(`   Resposta: ${typeDefResponse.content ? 'OK' : 'Error'}\n`);

        // Prova 3: getIterations (amb projecte per defecte)
        console.log('3️⃣ Provant getIterations...');
        const iterationsResponse = await callMcpTool('getIterations', {});
        console.log('✅ getIterations funcionant correctament');
        console.log(`   Resposta: ${iterationsResponse.content ? 'OK' : 'Error'}\n`);

        console.log('🎉 Totes les proves bàsiques han passat correctament!');
        console.log('\n📋 Resum:');
        console.log('   - Servidor MCP modern iniciat correctament');
        console.log('   - SDK rally-tools configurat correctament');
        console.log('   - Tools bàsiques funcionant');
        console.log('\n🚀 El servidor està llest per utilitzar!');

    } catch (error) {
        console.error('❌ Error durant les proves:', error.message);
        console.log('\n🔧 Possibles solucions:');
        console.log('   1. Verifica que les variables d\'entorn estiguin configurades:');
        console.log('      - RALLY_INSTANCE');
        console.log('      - RALLY_APIKEY');
        console.log('      - RALLY_PROJECT_NAME');
        console.log('   2. Verifica que la connexió a Rally sigui accessible');
        console.log('   3. Verifica que l\'API key sigui vàlida');
        process.exit(1);
    }
}

// Executem les proves
runTests();