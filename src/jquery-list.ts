// import $ from 'jquery'
// const regexLinks = /(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?((?:(?:[-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2}))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?/ig;

// type MatchToken = { end: number, isLink: boolean, content: string };
// const elements = [{ $tag: "1", header: 'Daniel', body: 'Best developer https://www.google.es in the world' }
//   , { $tag: "2", header: 'Rallo', body: 'Best economist https://www.youtube.es' }];

// $('#placeholder').on('click', '[data-template-delete]', function(e) {

// });

// $('#placeholder').on('click', '[data-template-view]', function(e) {
//   const tag = $(this)
//   .closest('[data-template-tag]')
//   .attr('data-template-tag');

//   preview(tag);
// });
// $('#placeholder').on('input', '[data-template-body]', function(e) {
//   console.log($(this).val())
// });

// function loadElements() {
//   elements.forEach(e => {
//     const template = $('#template')
//       .contents()
//       .clone();

//     template.attr('data-template-tag', e.$tag);
//     template.children('[data-template-header]').text(e.header);
//     template.children('[data-template-body]').text(e.body);

//     template.appendTo('#placeholder');
//   });
// }

// function preview(tags: string | string[] | undefined | null = null) {
//   if (tags === undefined || tags === null) {
//     preview(elements.map(e => e.$tag));
//   } else if (isArray(tags)) {
//     tags.forEach(tag => preview(tag));
//   } else {
//     const previewElement = $(`[data-template-tag="${tags}"] [data-template-preview]`);
//     const bodyElement = $(`[data-template-tag="${tags}"] [data-template-body]`);
//     previewElement.text('');
//     const jqueryObjects = convertHyperlinksTokensToJqueryObjects(tokenizeHyperlinks(new String(bodyElement.val()).valueOf()));
//     jqueryObjects.forEach(e => e.appendTo(previewElement));
//   }
// }

// function isArray<T>(o: any): o is T[] {
//   return Array.isArray(o);
// }

// function tokenizeHyperlinks(input: string) : MatchToken[] {

//   let parts: Array<MatchToken> = [];

//   for (let m of input.matchAll(regexLinks)) {
//     let prevPart = <MatchToken>{ end: 0 };
//     if (parts.length > 0) {
//       prevPart = parts[parts.length - 1];
//     }
//     parts.push({ end: prevPart.end + m.index!, isLink: false, content: input.substring(prevPart.end, m.index) });
//     parts.push({ end: m.index! + m[0].length, isLink: true, content: m[0].valueOf() });
//   }

//   const lastPart = parts[parts.length - 1];
//   if (lastPart.end != input.length) {
//     parts.push({ end: input.length, isLink: false, content: input.substring(lastPart.end) })
//   }

//   return parts;
// }

// function convertHyperlinksTokensToJqueryObjects(tokens: MatchToken[]) : (JQuery<HTMLLinkElement> | JQuery<Text>)[] {
//   return tokens.map(token => token.isLink ? <JQuery<HTMLLinkElement>>$(`<a target="_blank" href="${token.content}">${token.content}</a>`) : $(document.createTextNode(token.content)));
// }

// loadElements();
// preview();


// // <template id="template">
// //       <div data-template-tag>
// //         <h1 data-template-header></h1>
// //         <hr/>
// //         <textarea data-template-body rows="5" cols="40"></textarea>

// //         <pre data-template-preview></pre>
// //         <button data-template-delete>Delete</button>
// //         <button data-template-view>View</button>
// //       </div>
// //     </template>

// //     <div id="placeholder"></div>
