const socket = io();

// gửi data từ client lên server
// xử lý gửi status
const acknowledgements = (error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("gửi tin nhắn thành công");
  }
};

document.querySelector("#form-messages").addEventListener("submit", (e) => {
  e.preventDefault();
  const message = document.querySelector("#input-messages").value;
  socket.emit("send-message-client-to-server", message, acknowledgements);
});
socket.on(
  "send-message-server-to-client",
  ({ username, time, content, ...restProps }) => {
    document.querySelector(
      "#message-list"
    ).innerHTML += `<div class="message-item">
    <div class="message__row1">
        <p class="message__name">${username}</p>
        <p class="message__date">${time}</p>
    </div>
    <div class="message__row2">
        <p class="message__content">
            ${content}
        </p>
    </div>
</div>`;
  }
);
const { room, username } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
// console.log("room", room);
// console.log("username", username);
socket.emit("join-room-client-to-server", { room, username });

socket.on("send-user-list-server-to-client", (userList) => {
  document.querySelector("#user-list").innerHTML = userList
    .map((item, index) => ` <li class="app__item-user">${item.username}</li>`)
    .reduce((stringHtml, stringLi) => (stringHtml += stringLi), "");
});

document.querySelector("#btn-share-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Brower not support !!");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    const location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };

    socket.emit("share-location", location);
  });
});
socket.on("share-location-server-client", ({ username, time, urlLocation }) => {
  document.querySelector(
    "#message-list"
  ).innerHTML += `<div class="message-item">
      <div class="message__row1">
          <p class="message__name">${username}</p>
          <p class="message__date">${time}</p>
      </div>
      <div class="message__row2">
          <a href="${urlLocation}" target="_blank"> Vị trí của  ${username}</a>
      </div>
  </div>`;
});
