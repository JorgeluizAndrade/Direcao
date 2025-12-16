# Direção

## Visão Geral

**Direção** é um projeto desenvolvido para ser um indicador de vocação profissional. Ele utiliza tecnologias modernas para criar uma experiência interativa e intuitiva que ajuda os usuários a entenderem melhor suas afinidades profissionais.

## Tecnologias Utilizadas

- **HTML**: Fornece a estrutura básica do aplicativo. Contém o container principal onde a interface do usuário é dinamicamente renderizada.
- **CSS**: Responsável pelo design, garantindo uma experiência visual agradável e responsiva.
- **JavaScript**: Linguagem principal usada para lógica da aplicação:
  - **Módulos ES6**: Organização do código em arquivos como `main.js` e `utils.js`.
  - **Manipulação do DOM**: Componentes interativos criados diretamente no DOM.
  - **LocalStorage**: Persistência de dados do usuário para salvar progresso e resultados.
  - **Drag-and-Drop**: Permite arrastar elementos na interface para facilitar interações.

## Arquitetura e Estrutura

1. **Principal**:
   - Arquivo `index.html` serve como ponto de entrada, conectando o CSS e o JavaScript.

2. **Módulos JavaScript**:
   - `main.js`: Gerencia o fluxo principal da aplicação, controle de estado e renderização inicial.
   - `renderFunctions.js`: Contém funções para renderizar diferentes telas e componentes.
   - `utils.js`: Inclui funções utilitárias para manipulação de dados.

3. **Responsividade**:
   - Estrutura preparada para dispositivos móveis com dicas específicas para uso em celulares.

## Funcionalidades

- **Renderização Dinâmica**: A interface é construída dinamicamente com base nos passos do usuário.
- **Progresso Persistente**: Armazena os dados no navegador, permitindo continuar de onde parou.
- **Interatividade**: Uso de botões, interações de arrastar e soltar, e feedback visual para o usuário.

## Conclusão

A arquitetura modular do projeto e o uso de tecnologias web básicas o tornam acessível e de fácil manutenção. Ele serve como um recurso valioso para quem busca orientação profissional com uma abordagem prática e personalizada.
