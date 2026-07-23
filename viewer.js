const homeButton =
document.getElementById(
  "viewer-home-button"
);

if(homeButton){
  homeButton.href = "index.html";
}

        ${comment}

      </div>

    `;

  });

}


commentBtn.addEventListener(
  "click",
  () => {

    const text =
    commentInput.value.trim();

    if(!text) return;

    const comments =
    JSON.parse(
      localStorage.getItem(fileId)
    ) || [];

    comments.push(text);

    localStorage.setItem(
      fileId,
      JSON.stringify(comments)
    );

    commentInput.value = "";

    loadComments();

  }
);


loadComments();
