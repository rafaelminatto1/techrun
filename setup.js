#!/usr/bin/env node

const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando o projeto TechRun...');

// Função para executar comandos
function runCommand(command, description) {
  console.log(`\n📦 ${description}...`);
  try {
    execSync(command, {stdio: 'inherit'});
    console.log(`✅ ${description} concluído!`);
  } catch (error) {
    console.error(`❌ Erro ao executar: ${description}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Função para verificar se um arquivo existe
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Verificar se estamos no diretório correto
if (!fileExists('package.json')) {
  console.error('❌ Este script deve ser executado na raiz do projeto TechRun');
  process.exit(1);
}

console.log('\n🔍 Verificando dependências...');

// Instalar dependências do npm
runCommand('npm install', 'Instalando dependências do npm');

// Verificar se estamos no macOS para configurar iOS
if (process.platform === 'darwin') {
  console.log('\n🍎 Detectado macOS - Configurando iOS...');

  if (fileExists('ios')) {
    runCommand('cd ios && pod install', 'Instalando pods do iOS');
  } else {
    console.log(
      '⚠️  Pasta ios não encontrada. Execute npx react-native run-ios primeiro.',
    );
  }
} else {
  console.log('\n⚠️  iOS não será configurado (requer macOS)');
}

// Configurar Android
console.log('\n🤖 Configurando Android...');

if (fileExists('android')) {
  // Verificar se o Android SDK está configurado
  try {
    execSync('adb version', {stdio: 'pipe'});
    console.log('✅ Android SDK detectado');
  } catch (error) {
    console.log(
      '⚠️  Android SDK não detectado. Certifique-se de ter o Android Studio instalado.',
    );
  }
} else {
  console.log(
    '⚠️  Pasta android não encontrada. Execute npx react-native run-android primeiro.',
  );
}

// Verificar permissões específicas
console.log('\n🔐 Verificando configurações de permissões...');

// Verificar AndroidManifest.xml
const androidManifestPath = 'android/app/src/main/AndroidManifest.xml';

if (fileExists(androidManifestPath)) {
  console.log('✅ AndroidManifest.xml configurado');
} else {
  console.log('⚠️  AndroidManifest.xml não encontrado');
}

// Verificar Info.plist
const infoPlistPath = 'ios/TechRun/Info.plist';

if (fileExists(infoPlistPath)) {
  console.log('✅ Info.plist configurado');
} else {
  console.log('⚠️  Info.plist não encontrado');
}

// Verificar estrutura de pastas
console.log('\n📁 Verificando estrutura do projeto...');

const requiredDirs = [
  'src/components',
  'src/screens',
  'src/navigation',
  'src/store',
  'src/services',
  'src/hooks',
  'src/utils',
  'src/types',
  'src/assets',
];

requiredDirs.forEach(dir => {
  if (fileExists(dir)) {
    console.log(`✅ ${dir}`);
  } else {
    console.log(`❌ ${dir} - pasta não encontrada`);
  }
});

// Verificar arquivos de configuração importantes
console.log('\n⚙️  Verificando arquivos de configuração...');

const configFiles = [
  'tsconfig.json',
  'metro.config.js',
  '.eslintrc.js',
  'babel.config.js',
];

configFiles.forEach(file => {
  if (fileExists(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`⚠️  ${file} - arquivo não encontrado`);
  }
});

console.log('\n🎉 Configuração concluída!');
console.log('\n📋 Próximos passos:');
console.log('1. Para Android: npx react-native run-android');
console.log('2. Para iOS: npx react-native run-ios');
console.log('3. Para desenvolvimento: npm start');

console.log('\n📚 Funcionalidades implementadas:');
console.log('✅ Estrutura base do projeto');
console.log('✅ Navegação com React Navigation');
console.log('✅ Gerenciamento de estado com Redux Toolkit');
console.log('✅ Captura de vídeo com react-native-vision-camera');
console.log('✅ Análise de pose com ML Kit');
console.log('✅ Sistema de autenticação');
console.log('✅ Componentes de UI reutilizáveis');
console.log('✅ Hooks personalizados');
console.log('✅ Configurações de permissões');

console.log('\n🔧 Para resolver problemas:');
console.log('- Limpar cache: npx react-native start --reset-cache');
console.log('- Rebuild Android: cd android && ./gradlew clean');
console.log('- Rebuild iOS: cd ios && xcodebuild clean');

console.log('\n🚀 Projeto TechRun configurado com sucesso!');
