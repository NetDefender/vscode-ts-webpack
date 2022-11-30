type TitleNode = {
  NodeId: string,
  NodeLevel: number,
  NodeOrder: number,
  NodeText: string,
  Children: TitleNode[]
}


function UpdateWithNewCustomId() {
  document.querySelectorAll('.container-top *').forEach((element, index) => element.setAttribute('data-uid', index.toString()));
}

function CreateTitleList() {
  const nodeList: TitleNode[] = [];
  const nodeStack: TitleNode[] = [];
  const titles = document.querySelectorAll('h1,h2,h3,h4,h5');

  titles.forEach((titleNode, order) => {
    const nodeId = `${titleNode.tagName}_${order}`;
    const nodeLevel = parseInt(titleNode.tagName[1]!);
    titleNode.setAttribute('data-title-id', nodeId);

    const newNode: TitleNode = {
      NodeId: nodeId,
      NodeLevel: nodeLevel,
      NodeOrder: order,
      NodeText: titleNode.textContent || '',
      Children: []
    }
    nodeList.push(newNode);

    while(true){
      let prevNode = nodeStack.at(-1);
      if(!prevNode) {
        break;
      }
      if(prevNode.NodeLevel >= newNode.NodeLevel) {
        nodeStack.pop();
      } else {
        break;
      }
    }
    const prevNode = nodeStack.at(-1);
    if(prevNode){
      prevNode.Children.push(newNode);
    }

    nodeStack.push(newNode);
  })

  return nodeList;
}

function RenderTitles(nodeId: string, nodeList: TitleNode[]) {
  //const rootNode = document.getElementById(nodeId);

  const rootTitleNodes: TitleNode[] = [];
  nodeList.forEach(node => {
    if(node.NodeLevel === 1) {
      rootTitleNodes.push(node);
    }
  });
  rootTitleNodes.sort((a, b) => a.NodeOrder - b.NodeOrder)
    .forEach(node => RenderSelfAndChildren(nodeId, node))

  function RenderSelfAndChildren(parentNodeId: string, titleNode: TitleNode) {
    const parentNode = document.getElementById(parentNodeId)!;
    const newTitleNode = document.createElement('li');
    newTitleNode.id = titleNode.NodeId;
    newTitleNode.innerHTML = `<a>${titleNode.NodeText}</a>`;
    parentNode.appendChild(newTitleNode);
    if(titleNode.Children.length > 0) {
      const ul = document.createElement('ul');
      ul.id = `${newTitleNode.id}_ul`;
      newTitleNode.appendChild(ul);
      titleNode.Children.forEach(child => RenderSelfAndChildren(ul.id, child));
    }
  }
}

function UpdateRanges(titleList: TitleNode[]){
  const workTitles = titleList.concat([titleList.at(-1)!]);
  const lastIndex = workTitles.length - 1;
  workTitles.forEach((item, index) => {
    if(index !== 0)  {
      const prevTitle = workTitles[index - 1];
      const currentTitle = workTitles[index];
      const range = document.createRange();
      range.setStart(document.querySelector(`[data-title-id="${prevTitle.NodeId}"]`)!, 0);
      const endElement = document.querySelector(`[data-title-id="${currentTitle.NodeId}"]`)!;
      if(lastIndex === index) {
       console.log(lastIndex) ;
      }
      range.setEnd(endElement, lastIndex === index ? 1 : 0);
      range.cloneContents().querySelectorAll('*').forEach((element, index) => {
        const uid = element.getAttribute('data-uid');
        const subElement = document.querySelector(`[data-uid="${uid}"`);
        if(subElement) {
            const targetNodeId = subElement.getAttribute('data-title-id');
            subElement.setAttribute('data-scroll-id', targetNodeId === currentTitle.NodeId ? currentTitle.NodeId : prevTitle.NodeId);
            subElement.removeAttribute('data-uid');
        }
      });
    }
  });
}
UpdateWithNewCustomId();
const titleList = CreateTitleList();
RenderTitles('titles', titleList);
UpdateRanges(titleList);

const observer = new IntersectionObserver(TitlesIntersected,{root: document.getElementById('container-top')});
const hs = document.querySelectorAll('.container-top [data-scroll-id]');
hs.forEach(h => observer.observe(h));

const mapScrollId = new Map<string, number>();
function TitlesIntersected(entries: IntersectionObserverEntry[], observer: IntersectionObserver){
  entries.forEach(({boundingClientRect,
    intersectionRatio,
    intersectionRect,
    isIntersecting,
    rootBounds,
    target,
    time}) => {
      const scrollId = target.getAttribute('data-scroll-id')!;
      const titleLi = document.getElementById(scrollId)!;
      const titleSpan = titleLi.querySelector('a:first-child')!;
      let value = 0;
      if(mapScrollId.has(scrollId)) {
        value = mapScrollId.get(scrollId)!;
      }

      if(isIntersecting) {
        value++;
      } else{
        if(value > 0) {
          value--;
        }
      }
      if(value === 0) {
        titleSpan.classList.remove('title-selected');
      } else {
        if(!titleSpan.classList.contains('title-selected')){
          titleSpan.classList.add('title-selected');
        }
      }
      mapScrollId.set(scrollId, value);
  });
}

function Log(message: string){
  const logContainer = document.getElementById('log')!;
  const logMessage = document.createElement('p')!;
  logMessage.className = "log-message";
  logMessage.textContent = message;
  logContainer.appendChild(logMessage);
}
