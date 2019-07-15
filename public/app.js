let fetchAndUpdate = () => {
  fetch('/messages')
    .then(response => {
      return response.text();
    })
    .then(responseBody => {
      let parsed = JSON.parse(responseBody);
      let msgListUL = document.getElementById('msg-list');
      msgListUL.innerHTML = '';
      parsed.forEach(elem => {
        let li = document.createElement('li');
        li.innerHTML = `<img src="${elem.path}" width="200px"/><div>${elem.msg}</div><h5 style="color:${elem.color}">${
          elem.user
        }</h5>`;
        msgListUL.append(li);
      });
    });
};

fetchAndUpdate();
setInterval(fetchAndUpdate, 500);
