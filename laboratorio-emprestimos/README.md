# Sistema de Empréstimo de Equipamentos

Aplicativo para controlar empréstimos de equipamentos do laboratório. Pode ser utilizado no computador ou pelo navegador em celulares e tablets.

## Executar no computador durante o desenvolvimento

1. Instale o [Node.js](https://nodejs.org/).
2. Abra o terminal nesta pasta (`laboratorio-emprestimos`).
3. Instale as dependências:

   ```bash
   npm install
   ```

4. Inicie o aplicativo no navegador:

   ```bash
   npm run dev
   ```

5. Abra o endereço exibido no terminal, normalmente `http://localhost:5173`.

Para testar a versão de desktop em uma janela própria durante o desenvolvimento, use:

```bash
npm run desktop:dev
```

## Gerar o instalador do Windows (.exe)

Em um computador Windows, abra o terminal nesta pasta e execute:

```bash
npm install
npm run desktop:dist
```

Ao concluir, o instalador será criado na pasta `release`, com o nome `Empréstimo de Equipamentos SESI-Setup-1.0.3.exe`. Execute o arquivo para instalar o aplicativo. O instalador cria atalhos no Menu Iniciar e na Área de Trabalho.

O Node.js é necessário para gerar o instalador, mas não para usar o aplicativo já instalado. A instalação é por usuário do Windows e permite escolher a pasta de destino.

## Publicar para celular ou tablet

Para instalar o aplicativo em outros dispositivos pelo navegador, publique a versão web em um serviço de hospedagem com endereço **HTTPS**. Gere os arquivos com:

```bash
npm run build
```

Os arquivos para hospedagem serão gerados na pasta `dist`.

- **Android (Chrome):** abra o endereço HTTPS, toque no menu do navegador e escolha **Instalar aplicativo** ou **Adicionar à tela inicial**.
- **iPhone/iPad (Safari):** abra o endereço HTTPS, toque em **Compartilhar** e escolha **Adicionar à Tela de Início**.
- **Computador:** use a opção **Instalar aplicativo** do navegador, quando disponível, ou gere o instalador `.exe` conforme as instruções acima.

Para visualizar a versão web de produção localmente, execute `npm run preview`.

## Atenção aos dados

Os equipamentos, usuários e empréstimos ficam salvos localmente no navegador ou no aplicativo instalado em cada computador. Eles não são sincronizados automaticamente entre dispositivos. Use as opções de exportação e importação de backup JSON para transferir dados.
