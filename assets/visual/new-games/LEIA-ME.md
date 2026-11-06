# Novas artes — Balança, Sílabas e Caça-Erro

Quatro pranchas PNG com transparência, feitas com geração de imagens integrada e organizadas para recorte. A paleta e o acabamento 3D cartoon seguem os selos existentes do Duelo do Futuro EEJAM.

- `new-games-seals-3d-v1.png`: três selos para seleção, com os nomes dos novos jogos.
- `balanca-dos-numeros-assets-v1.png`: 12 elementos; grade de quatro colunas e três linhas.
- `silabas-soltas-assets-v1.png`: 16 elementos; grade de quatro colunas e quatro linhas.
- `caca-erro-assets-v1.png`: 16 elementos; grade de quatro colunas e quatro linhas.

As faces de pesos, blocos, palavras e pistas foram deixadas em branco para o jogo escrever números, sílabas e frases dinamicamente. Texto funcional deve continuar sendo desenhado pelo aplicativo. Os selos são peças de identificação visual e já contêm seus títulos.

Use a ordem dos itens em `catalog-and-prompts-v1.json` para identificar as células, da esquerda para a direita e de cima para baixo. As grades são orientativas: ao recortar, preserve a silhueta completa e ajuste margens quando necessário. Para montar a balança animada, use suporte, viga e prato separados; a versão completa serve como ilustração.

As pranchas originais permanecem preservadas. A integração foi concluída em new-art.js e new-art.css: os selos aparecem no catálogo e no sorteio; a balança usa suporte, viga, pratos e pesos; Sílabas Soltas usa blocos, espaços de encaixe e pistas; Caça-Erro usa cartões normal, correto e incorreto. Os números e textos são desenhados pelo jogo. Os arquivos também fazem parte do cache offline.
