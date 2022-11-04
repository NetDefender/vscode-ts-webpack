import $ from 'jquery'

let isCollapsed = false;
const showSideBar = () => {
  isCollapsed = false;
  $('#sidebar').css('right', '0');
}
const hideSidebar = () => {
  isCollapsed = true;
  $('#sidebar').css('right', '-180px');
}

function moveSidebarBy (x: number) {
  let newWidth = $('#sidebar').width()! + x;
  $('#sidebar').css("width", `${newWidth}px`);
}

function moveSidebar (x: number) {
  $('#sidebar').css("width", `${x}px`);
}

$('#manageSidebar').on('click', function() {
  const right = $('#sidebar').css('right');
  if(right == '0px') {
    hideSidebar();
  } else {
    showSideBar();
  }
})

$('#draggerLeft').on('mousedown', function(e) {
  if(!isCollapsed) {
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', () => document.removeEventListener('mousemove', drag));
  }
});

function drag(e: MouseEvent) {
  let pos = window.innerWidth - e.clientX;
  if(pos < 200) {
    pos = 200;
  } else if(pos > window.innerWidth - 100) {
    pos = window.innerWidth - 100;
  }
  moveSidebar(pos)
}
