/**
 * @author      qingwei.li <cinwell.li@gmail.com>
 * @createTime  2015-11-28 01:21
 */
'use strict';
(function () {
  var OpenImage = function() {};

  OpenImage.fn = OpenImage.prototype;

  OpenImage.prototype.initialize = function() {
    this.bindEvents();
  };

  OpenImage.prototype.bindEvents = function() {
    var _this = this;

    /**
     * 监听鼠标右键事件（右键菜单），记录下当前 point 的坐标，并寻找当前元素的图片
     */
    window.addEventListener('contextmenu', function(e) {
      _this.target = e.target || e.srcElement;
      _this.position = {
        X: e.x,
        Y: e.y
      };
    }, false);

    /**
     * 监听 chrome 插件发送请求的事件，并作出对应响应
     */
    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
      switch(request) {
        case 'GET_URL':
          _this.image = _this.findImage(_this.target);
          _this.handlerImage(_this.image);
          if (!_this.image) {
            alert('Sorry, I can\'t find any images here :(');
            return;
          }
          sendResponse({value: _this.image});
          break;
        default:
          break;
      };
    });
  };

  /**
   * 搜索图片
   * @description
   * 会先从当前元素开始搜索，如果找不到就找子元素是否的图片，如果依旧找不到就从父级元素开始找
   * 如果依旧找不到，则返回 undefined
   *
   * @param  {object} element 需要搜索的元素
   * @return {string}         图片的 src
   */
  OpenImage.prototype.findImage = function(element) {
    var image;
    var flag = false;

    if (!element) {
      return;
    }

    image = this.getImage(element) || this.findImageByAllChildNodes(element, flag);
    if(!image && element.parentNode) {
      element = element.parentNode;
      image = this.getImage(element) || this.findImageByAllChildNodes(element, flag);
    }
    return image;
  };

  /**
   * 从子元素搜索图片
   * @param  {object} element 需要搜索的元素
   * @return {string}         图片的 src
   */
  OpenImage.prototype.findImageByAllChildNodes = function(element) {
    var nodes;

    nodes = element.childNodes;
    for (var i = 0; i < nodes.length; i++) {
      var currentNode = nodes[i];
      var image;

      if (currentNode.nodeType !== 1) {
        continue;
      }
      image = this.getImage(currentNode);
      if (!image && currentNode.childNodes.length >= 1) {
        image = this.findImageByAllChildNodes(currentNode);
      }
      if (image) {
        return image;
      }
    }
  };

  /**
   * 处理图片
   * @param  {string} image 图片的 src
   */
  OpenImage.prototype.handlerImage = function(image) {
    if (!image) {
      return;
    }

    this.image = image;
    // console.log('[Open Image]: find the image:', this.image);
  };

  /**
   * 检查是否是 point 所指向的元素
   * @param  {object} element 待检查的元素
   * @return {bool}         是否是符合要求的图片
   */
  OpenImage.prototype.checkImage = function(element) {
    var rect = element.getBoundingClientRect();
    var originY = rect.top;
    var originX = rect.left;
    var elementWidth = rect.width;
    var elementHeight = rect.height;
    var endY = originY + elementHeight;
    var endX = originX + elementWidth;

    if (originX <= this.position.X
        && endX >= this.position.X
        && originY <= this.position.Y
        && endY >= this.position.Y) {
      return true;
    }
    return false;
  };

  /**
   * 从元素上得到图片
   */
  OpenImage.prototype.getImage = function(element) {
    if (element.nodeName === 'IMG') {
      return this.getImageFromSrc(element);
    } else {
      return this.getImageFromBackground(element);
    }
  };

  /**
   * 从是 img tag 的 src 属性上获取图片
   */
  OpenImage.prototype.getImageFromSrc = function(element) {
    if (this.checkImage(element)) {
      return element.src;
    }
    return;
  };

  /**
   * 从 style 的 background-image 上获取图片
   */
  OpenImage.prototype.getImageFromBackground = function(element) {
    var value = document.defaultView.getComputedStyle(element, null)
      .getPropertyValue('background-image');

    if (/url\(\S+\)/g.test(value) && this.checkImage(element)) {
      return value.replace(/url\([\'\"]+?(\S+)[\'\"]+?\)/g, '$1');
    }
    return;
  };

  new OpenImage().initialize();
})();
