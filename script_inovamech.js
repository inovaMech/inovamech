const buttons = document.querySelectorAll(".tab-btn");
const sections = document.querySelectorAll(".tab-content");

const readmeUrl = "https://raw.githubusercontent.com/inovaMech/inovamech/main/README.md";
let readmeCarregado = false;

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    // troca de abas
    buttons.forEach(b => b.classList.remove("active"));
    sections.forEach(s => s.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");

    // carregar README só quando abrir "sobre"
    if (btn.dataset.tab === "sobre" && !readmeCarregado) {
      fetch(readmeUrl)
        .then(res => res.text())
        .then(text => {
          document.getElementById("readme-content").innerHTML = marked.parse(text);
          readmeCarregado = true;
        })
        .catch(() => {
          document.getElementById("readme-content").innerText = "Erro ao carregar conteúdo.";
        });
    }
  });
});