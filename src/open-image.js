/**
 * @author      qingwei.li <cinwell.li@gmail.com>
 * @createTime  2015-11-28 01:21
 */
(function () {
  OpenImage = function() {};

  OpenImage.fn = OpenImage.prototype;

  OpenImage.prototype.initialize = function() {
    this.bindEvents();
  };

  OpenImage.prototype.bindEvents = function() {
    var _this = this;
    window.addEventListener('contextmenu', function(e) {
      var target = e.target || e.srcElement;

      _this.position = {
        X: e.x,
        Y: e.y
      };
      _this.image = _this.findImage(target);
      _this.handlerImage(_this.image);
    }, false);

    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
      if (!_this.image) {
        alert('Sorry, I can\'t find this image. :(');
        return;
      }

      switch(request) {
        case 'GET_URL':
          sendResponse({value: _this.image});
          break;
        default:
          break;
      };
    });
  };

  OpenImage.prototype.findImage = function(element) {
    var image;
    var flag = false;

    if (!element) {
      return;
    }

    // find from current element
    image = this.getImage(element);
    if(image) {
      return image;
    }

    // find from childNodes
    image = this.findImageByAllChildNodes(element, flag);
    if (image) {
      return image;
    }

    // find from parent node start
    if (element.parentNode) {
      image = this.findImage(element.parentNode);
      if (image) {
        return image;
      }
    }

    return;

  };

  OpenImage.prototype.findImageByAllChildNodes = function(element, flag) {
    var nodes;

    if (flag) {
      return;
    }

    nodes = element.childNodes;
    for (var i = 0; i < nodes.length; i++) {
      var currentNode = nodes[i];
      var image;

      if (currentNode.nodeType !== 1) {
        continue;
      }

      image = this.getImage(currentNode);
      if (image) {
        flag = true;
        return image;
      }

      if (currentNode.childNodes.length >= 1) {
        image = this.findImageByAllChildNodes(currentNode, flag);
        if (image) {
          flag = true;
          return image;
        }
      }

    }
  };

  OpenImage.prototype.handlerImage = function(image) {
    if (!image) {
      return;
    }

    this.image = image;
    // console.log('[Open Image]: find the image:', this.image);
  };

  OpenImage.prototype.checkImage = function(element) {
    var originY = element.offsetTop;
    var originX = element.offsetLeft;
    var elementWidth = element.offsetWidth;
    var elementHeight = element.offsetHeight;
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

  OpenImage.prototype.getImage = function(element) {
    var value;

    if (element.nodeName === 'IMG') {
      return element.src;
    }

    value = document.defaultView.getComputedStyle(element, null)
      .getPropertyValue('background-image');

    if (!/url\(\S+\)/g.test(value)) {
      return;
    }

    if (!this.checkImage(element)) {
      return;
    }

    return value.replace(/url\([\'\"]*(\S+)[\'\"]*\)/g, '$1');

  };

  new OpenImage().initialize();
})();
