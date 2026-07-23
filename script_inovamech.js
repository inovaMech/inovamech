/* ==================================================
   GOOGLE DRIVE API
================================================== */

const API_KEY =
"AIzaSyDFCv2h3zfl_BFM91emKdWr9YM_xGqyzSM";


/* ==================================================
   FORMULÁRIO DE PARTICIPAÇÃO
================================================== */

function configureJoinTeamForm(){

  const form =
  document.getElementById("join-team-form");
  const status =
  document.getElementById("join-team-status");

  if(!form) return;

  form.addEventListener("submit", async event => {

    event.preventDefault();

    const submitButton =
    form.querySelector('button[type="submit"]');

    submitButton?.setAttribute("disabled", "disabled");
    if(status){
      status.textContent = "Enviando...";
      status.classList.remove("error", "success");
    }

    const formData =
    new FormData(form);

    const name =
    formData.get("name");

    const email =
    formData.get("email");

    const interest =
    formData.get("interest");

    const message =
    formData.get("message");

    const endpoint =
    "https://formsubmit.co/ajax/inovamechdcet1@uneb.br";

    const mailtoBody =
    `Nome: ${name}\nE-mail: ${email}\nVínculo ou área de interesse: ${interest}\n\nMensagem:\n${message}`;

    const mailto =
    `mailto:inovamechdcet1@uneb.br?cc=inovamech.eng@gmail.com&subject=${encodeURIComponent("Interesse em fazer parte do INOVAMECH")}&body=${encodeURIComponent(mailtoBody)}`;

    try {
      formData.append("_subject", "Interesse em fazer parte do INOVAMECH");
      formData.append("_captcha", "false");

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Accept": "application/json",
        },
        body: formData,
      });

      if(!response.ok){
        throw new Error("Resposta do servidor não OK");
      }

      const data = await response.json();

      if(data.success === true || data.success === "true"){
        if(status){
          status.textContent =
          "Enviado com sucesso! Obrigado pelo interesse.";
          status.classList.add("success");
        }
        form.reset();
      } else {
        throw new Error(data.message || "Erro no envio direto.");
      }
    } catch (error) {
      if(status){
        status.textContent =
        "Não foi possível enviar diretamente. Abrindo o cliente de e-mail como alternativa...";
        status.classList.add("error");
      }
      window.location.href = mailto;
    } finally {
      submitButton?.removeAttribute("disabled");
    }
  });

}


configureJoinTeamForm();


/* ==================================================
   FAVICONS DAS RECOMENDAÇÕES
================================================== */

function loadRecommendationFavicons(){

  document
    .querySelectorAll(".recommend-logo[data-favicon-url]")
    .forEach(logo => {

      const websiteUrl =
      logo.dataset.faviconUrl;

      if(!websiteUrl) return;

      const website =
      new URL(websiteUrl);

      const ownFavicon =
      /\.(ico|png|svg|jpg|jpeg|webp)$/i.test(website.pathname)
        ? website.href
        : `${website.origin}/favicon.ico`;

      const fallbackFavicon =
      `https://www.google.com/s2/favicons?domain=${website.hostname}&sz=64`;

      logo.src = ownFavicon;

      logo.onerror = () => {

        logo.onerror = () => {

          logo.removeAttribute("src");

        };

        logo.src = fallbackFavicon;

      };

    });

}


/* ==================================================
   VIEWER PATH
================================================== */

function getViewerPath(){

  const path =
  window.location.pathname;

  if(path.includes("/pages/")){

    return "../viewer.html";

  }

  return "viewer.html";

}


/* ==================================================
   PAGE NAME
================================================== */

function getPageName(){

  return window.location.pathname
    .split("/")
    .pop()
    .replace(".html","");

}


/* ==================================================
   LOAD FILES
================================================== */

async function loadDriveFiles(
  folderId,
  containerId,
  filterFolders = false
){

  const container =

  document.getElementById(
    containerId
  );

  if(!container) return;


  /* =========================================
     LOADING
  ========================================= */

  container.innerHTML = `

    <div class="empty-message">

      Carregando arquivos...

    </div>

  `;


  /* =========================================
     API URL
  ========================================= */

  const url =

  `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&key=${API_KEY}&fields=files(id,name,mimeType,thumbnailLink)`;


  try{

    const response =
    await fetch(url);

    const data =
    await response.json();


    container.innerHTML = "";


    /* =========================================
       FILES
    ========================================= */

    let files =
    data.files || [];


    /* =========================================
       REMOVE SUBPASTAS
    ========================================= */

    if(filterFolders){

      files = files.filter(file => {

        return file.mimeType !==
        "application/vnd.google-apps.folder";

      });

    }


    /* =========================================
       SEM ARQUIVOS
    ========================================= */

    if(files.length === 0){

      // quando não há arquivos, não mostrar mensagem -- manter container vazio
      container.innerHTML = "";

      return;

    }


    /* =========================================
       VIEWER
    ========================================= */

    const viewerPath =
    getViewerPath();


    /* =========================================
       PAGE NAME
    ========================================= */

    const pageName =
    getPageName();


    /* =========================================
       OPTIONAL FILTERS (por página/pasta)
       Remover itens que não pertencem aqui
    ========================================= */

    // Excluir itens por nome para a página de Robótica (projetos)
    if(pageName === "robotica-sistemas" && containerId === "grid-projetos"){
      files = files.filter(f => {
        const n = (f.name || "").toLowerCase();
        // remover itens que mencionam mineração ou fundamentos de mineração
        if(n.includes("minera") && n.includes("fund")) return false;
        if(n.includes("fundamentos de minera") || n.includes("fundamentos de mineração")) return false;
        return true;
      });
    }

    // Excluir exercícios listados em Projetos por Turmas
    if(pageName === "robotica-sistemas" && containerId === "grid-projetos-turmas"){
      files = files.filter(f => {
        const n = (f.name || "").toLowerCase();
        if(n.includes("exerc") || n.includes("exercício") || n.includes("exercicio")) return false;
        return true;
      });
    }


    /* =========================================
       LOOP FILES
    ========================================= */

    files.forEach(file => {


      /* =====================================
         PREVIEW
      ===================================== */

      const preview =

      file.thumbnailLink ||

      "https://via.placeholder.com/600x350/0f172a/00e5ff?text=INOVAMECH";


      /* =====================================
         FROM PARAM
      ===================================== */

      let fromParam =
      pageName;


      /* =====================================
         DETERMINE SE O CARD DEVE SER ATIVO
         - desativar se for pasta
         - desativar se não tiver nome
         - desativar se não tiver thumbnailLink (provavelmente sem arquivo)
      ===================================== */

      const isFolder = file.mimeType === "application/vnd.google-apps.folder";
      const hasName = (file.name || "").trim().length > 0;
      const hasThumbnail = !!file.thumbnailLink;

      const shouldDisable = isFolder || !hasName || !hasThumbnail;

      /* =====================================
         CARD (ativo ou desativado)
      ===================================== */

      let card = "";

      if(shouldDisable){

        card = `

          <div class="drive-card disabled" aria-disabled="true">

            <img
              src="${preview}"
              alt="${file.name || "Sem título"}"
              class="drive-preview"
            >

            <div class="drive-info">

              <h3>

                ${file.name || "Sem título"}

              </h3>

            </div>

          </div>

        `;

      } else {

        card = `

          <a
            href="${viewerPath}?id=${file.id}&from=${fromParam}"
            class="drive-card"
          >

            <img
              src="${preview}"
              alt="${file.name}"
              class="drive-preview"
            >

            <div class="drive-info">

              <h3>

                ${file.name}

              </h3>

            </div>

          </a>

        `;

      }


      container.innerHTML +=
      card;

    });

  }

  catch(error){

    console.error(
      "Erro Google Drive:",
      error
    );

    container.innerHTML = `

      <div class="empty-message">

        Erro ao conectar com Google Drive.

      </div>

    `;

  }

}


/* ==================================================
   HOME BUTTON -> "VOLTAR" (LÓGICO)
   Nas páginas de eixo, volta pra Home.
   Na Home, não faz nada (não existe o botão lá).
================================================== */

function configureHomeButton(){

  const button =

  document.querySelector(
    ".home-button"
  );

  if(!button) return;


  const path =
  window.location.pathname;


  /* ESTAMOS EM /pages/ -> volta pra home */

  if(path.includes("/pages/")){

    button.href = "../index.html";

  }

  /* ESTAMOS NO VIEWER -> volta pra home */

  else if(path.includes("viewer.html")){

    button.href = "index.html";

  }

  else{

    button.href = "index.html";

  }

}


/* ==================================================
   MENU HORIZONTAL (TOPO) - MARCA ABA ATIVA
   Funciona tanto na Home quanto nas páginas de eixo
================================================== */

function setActiveTabLink(){

  const currentFile =
  window.location.pathname
    .split("/")
    .pop();


  document
    .querySelectorAll(".tab-link")
    .forEach(link => {

      const hrefFile =
      link.getAttribute("href")
        .split("/")
        .pop();

      if(hrefFile === currentFile){

        link.classList.add("active");

      }

      else{

        link.classList.remove("active");

      }

    });

}


/* ==================================================
   MENU LATERAL FIXO - 5 EIXOS DE INOVAÇÃO
   (Mesma ideia do menu antigo, ícones no padrão do site)
================================================== */

function createSideNav(){

  const currentPage =
  window.location.pathname
    .split("/")
    .pop();


  /* NÃO MOSTRA NA HOME */

  if(
    currentPage === "index.html" ||
    currentPage === ""
  ){

    return;

  }


  /* Marca o <body> pra CSS saber que essa página tem
     o menu lateral (evita empurrar o conteúdo nas
     páginas que não têm, como a Home) */

  document.body.classList.add('has-side-nav');


  const isInPages =
  window.location.pathname.includes('/pages/');


  /* ÍCONES SVG DOS EIXOS (mesmo estilo do site: linhas finas, currentColor) */

  const svgRobotica =
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M9 8V4h6v4"/><circle cx="9" cy="14" r="1.5"/><circle cx="15" cy="14" r="1.5"/><path d="M4 13H2M22 13h-2"/></svg>`;

  const svgConstrucao =
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12v2H6z"/><rect x="3" y="6" width="18" height="14" rx="1"/><path d="M9 10v8M15 10v8M6 14h12"/></svg>`;

  const svgAutomacao =
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6"/><path d="M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24"/><path d="M1 12h6m6 0h6"/><path d="M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"/></svg>`;

  const svgMineracao =
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><line x1="12" y1="12" x2="19" y2="5"/><line x1="12" y1="12" x2="5" y2="19"/><line x1="12" y1="12" x2="5" y2="5"/><line x1="12" y1="12" x2="19" y2="19"/></svg>`;

  const svgEnergia =
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;


  /* ITENS DO MENU - 5 EIXOS */

  const items = [

    {
      icon: svgRobotica,
      title: "Robótica e Sistemas Inteligentes",
      href: isInPages ? "robotica-sistemas.html" : "pages/robotica-sistemas.html"
    },

    {
      icon: svgConstrucao,
      title: "Construção 4.0",
      href: isInPages ? "construcao-4.0.html" : "pages/construcao-4.0.html"
    },

    {
      icon: svgAutomacao,
      title: "Automação Industrial",
      href: isInPages ? "automacao-industrial.html" : "pages/automacao-industrial.html"
    },

    {
      icon: svgMineracao,
      title: "Mineração de Processos",
      href: isInPages ? "mineracao-processos.html" : "pages/mineracao-processos.html"
    },

    {
      icon: svgEnergia,
      title: "Energias Renováveis",
      href: isInPages ? "energias-renovaveis.html" : "pages/energias-renovaveis.html"
    },

  ];


  /* CONTAINER */

  const nav =
  document.createElement("div");

  nav.id = "side-nav";


  /* RENDER ITEMS */

  nav.innerHTML =

  items.map(item => {

    const hrefFile =
    item.href.split("/").pop();

    const isActive =
    hrefFile === currentPage;

    return `
      <a
        href="${item.href}"
        class="side-nav-item${isActive ? " active" : ""}"
        data-title="${item.title}"
      >
        ${item.icon}
      </a>
    `;

  }).join("");


  document.body.appendChild(nav);

}


/* ==================================================
   ABAS INTERNAS DE CADA EIXO
   (Introdução / Projetos / Projetos por Turmas / Artigos / Tutoriais)
================================================== */

function initTabs(){

  const tabs =
  document.querySelectorAll('.eixo-tab');

  const sections =
  document.querySelectorAll('.eixo-section');


  tabs.forEach(tab => {

    tab.addEventListener('click', function(e){

      e.preventDefault();

      const target =
      this.getAttribute('data-target');


      /* REMOVE ACTIVE */

      tabs.forEach(t => {
        t.classList.remove('active');
      });

      sections.forEach(s => {
        s.classList.remove('active-section');
      });


      /* ADICIONA ACTIVE */

      this.classList.add('active');

      const targetSection =
      document.getElementById(target);

      if(targetSection){
        targetSection.classList.add('active-section');
      }

    });

  });

}


/* ==================================================
   SMOOTH SCROLL
================================================== */

function setupSmoothScroll(){

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener('click', function (e) {

      const targetId = this.getAttribute('href');

      const targetElement = document.querySelector(targetId);

      /* Só aplica smooth scroll se o alvo existir e não for uma aba do eixo
         (as abas já têm sua própria lógica de troca de conteúdo) */

      if(targetElement && !this.classList.contains('eixo-tab')){

        e.preventDefault();

        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

      }

    });

  });

}


/* ==================================================
   ANIMAÇÕES AO SCROLL (fade-in dos cards)
================================================== */

function setupScrollAnimations(){

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {

    entries.forEach(entry => {

      if(entry.isIntersecting){

        entry.target.style.animation = 
        'fadeInUp 0.6s ease-out forwards';

        observer.unobserve(entry.target);

      }

    });

  }, observerOptions);


  const elementsToAnimate = document.querySelectorAll(

    '.drive-card, .card'

  );

  elementsToAnimate.forEach(element => {

    element.style.opacity = '0';

    observer.observe(element);

  });

}


/* ==================================================
   ESTILOS DE ANIMAÇÃO
================================================== */

const styleSheet = document.createElement('style');

styleSheet.textContent = `

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  * {
    scroll-behavior: smooth;
  }

`;

document.head.appendChild(styleSheet);


/* ==================================================
   INIT
================================================== */

document.addEventListener(

  "DOMContentLoaded",

  () => {

    configureHomeButton();

    setActiveTabLink();

    createSideNav();

    initTabs();

    setupSmoothScroll();

    setupScrollAnimations();

    console.log(
      '%cINOVAMECH - Script carregado (menu horizontal + lateral + abas)',
      'color: #00e5ff; font-size: 14px; font-weight: bold;'
    );

  }

);
