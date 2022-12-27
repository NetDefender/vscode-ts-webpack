import $ from "jquery";

let lastPosition = 300;
$("#auto-open").on("click", () => showSideBar());

let isCollapsed = false;
const showSideBar = () => {
  isCollapsed = false;
  $("#openCloseSidebar").text("keyboard_double_arrow_right");
  $("#sidebar").css({ right: "0px", width: `${lastPosition}px` });
  $("#user").trigger("focus");
  $("#resizeSizeBar").show();
};
const hideSidebar = () => {
  isCollapsed = true;
  moveSidebar(200, true);
  $("#sidebar").css("right", "-177px");
  $("#resizeSizeBar").hide();
  $("#openCloseSidebar").text("keyboard_double_arrow_left");
  document.removeEventListener("mousemove", drag);
};

$("#openCloseSidebar").on("click", function () {
  const right = $("#sidebar").css("right");
  if (right == "0px") {
    hideSidebar();
  } else {
    showSideBar();
  }
});

$("#resizeSizeBar").on("mousedown", function (e) {
  if (!isCollapsed) {
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", () =>
      document.removeEventListener("mousemove", drag)
    );
  }
});

function drag(e: MouseEvent) {
  let pos = window.innerWidth - e.clientX;
  if (pos < 300) {
    pos = 300;
    hideSidebar();
    return;
  }

  if (pos > window.innerWidth - 100) {
    pos = window.innerWidth - 100;
  }
  moveSidebar(pos);
}

function moveSidebar(x: number, ignoreLastPosition: boolean = false) {
  if (!ignoreLastPosition) {
    lastPosition = x;
  }
  $("#sidebar").css("width", `${x}px`);
}
