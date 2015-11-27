/**
 * @author      qingwei.li <cinwell.li@gmail.com>
 * @createTime  2015-11-28 01:21
 */
function openImage(info, tab) {
  chrome.tabs.sendMessage(tab.id, 'GET_URL', function(result) {
    chrome.tabs.create({url: result.value});
  });
};

chrome.contextMenus.create({
  'title': 'Open Image',
  'type' : 'normal',
  'contexts': ['all'],
  'onclick': openImage
});
