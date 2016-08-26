Named = require("./Named")
EventEmitter = require("eventemitter3")
$ = require("jquery")


class NamedManager extends EventEmitter
  constructor: ->
    super()

    @element = document.createElement("div")
    @namedies = []
    @destructors = []

    @initDOMStructure()
    @initStyle()
    @initEventListener()


  initDOMStructure: ->
    @$namedMgr = $(@element).addClass("namedMgr")
    return

  initStyle: ->
    @$namedMgr.css
      bottom: "0px"
      right: "0px"
      position: "fixed"
    $style = $("<style scoped />").text("""
      .scope {
        position: absolute;
        right: 0px;
        bottom: 0px;
        pointer-events: none;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      .surface {
        user-select: none;
      }
      .surface canvas {
        user-select: none;
        pointer-events: auto;
      }
      .blimp {
        position: absolute;
        top: 0px;
        left: 0px;
        pointer-events: auto;
      }
      .blimpCanvas {
        user-select: none;
      }
      /*!
       * jQuery contextMenu - Plugin for simple contextMenu handling
       *
       * Version: v1.10.3
       *
       * Authors: Björn Brala (SWIS.nl), Rodney Rehm, Addy Osmani (patches for FF)
       * Web: http://swisnl.github.io/jQuery-contextMenu/
       *
       * Copyright (c) 2011-2015 SWIS BV and contributors
       *
       * Licensed under
       *   MIT License http://www.opensource.org/licenses/mit-license

       * Date: 2015-12-03T20:12:18.263Z
       */.context-menu-list{position:absolute;display:inline-block;min-width:120px;max-width:250px;padding:0;margin:0;font-family:Verdana,Arial,Helvetica,sans-serif;font-size:11px;list-style-type:none;background:#eee;border:1px solid #ddd;-webkit-box-shadow:0 2px 5px rgba(0,0,0,.5);box-shadow:0 2px 5px rgba(0,0,0,.5)}.context-menu-item{position:relative;padding:2px 2px 2px 24px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;background-color:#eee}.context-menu-separator{padding-bottom:0;border-bottom:1px solid #ddd}.context-menu-item>label>input,.context-menu-item>label>textarea{-webkit-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text}.context-menu-item.hover{cursor:pointer;background-color:#39f}.context-menu-item.disabled{color:#666}.context-menu-input.hover,.context-menu-item.disabled.hover{cursor:default;background-color:#eee}.context-menu-submenu:after{position:absolute;top:0;right:3px;z-index:1;color:#666;content:">"}.context-menu-item.icon{min-height:18px;list-style-type:none;background-repeat:no-repeat;background-position:4px 2px}.context-menu-item.icon-edit{background-image:url(images/page_white_edit.png)}.context-menu-item.icon-cut{background-image:url(images/cut.png)}.context-menu-item.icon-copy{background-image:url(images/page_white_copy.png)}.context-menu-item.icon-paste{background-image:url(images/page_white_paste.png)}.context-menu-item.icon-delete{background-image:url(images/page_white_delete.png)}.context-menu-item.icon-add{background-image:url(images/page_white_add.png)}.context-menu-item.icon-quit{background-image:url(images/door.png)}.context-menu-input>label>*{vertical-align:top}.context-menu-input>label>input[type=checkbox],.context-menu-input>label>input[type=radio]{margin-left:-17px}.context-menu-input>label>span{margin-left:5px}.context-menu-input>label,.context-menu-input>label>input[type=text],.context-menu-input>label>select,.context-menu-input>label>textarea{display:block;width:100%;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}.context-menu-input>label>textarea{height:100px}.context-menu-item>.context-menu-list{top:5px;right:-5px;display:none}.context-menu-item.visible>.context-menu-list{display:block}.context-menu-accesskey{text-decoration:underline}
      /*# sourceMappingURL=jquery.contextMenu.min.css.map */
    """).appendTo(@$namedMgr)

    return

  initEventListener: ->
    return

  destructor: ->
    @namedies.forEach (named)-> named.destructor()
    @namedies = []
    @destructors.forEach (fn)-> fn()
    @$namedMgr.children().remove()
    @$namedMgr.remove()
    return

  materialize2: (shell, balloon)->
    namedId = @namedies.length
    named = new Named(namedId, shell, balloon, this)
    @namedies.push(named)
    @$namedMgr.append(named.element)
    return named

  materialize: (shell, balloon)->
    namedId = @namedies.length
    named = new Named(namedId, shell, balloon, this)
    @namedies.push(named)
    @$namedMgr.append(named.element)
    return namedId # namedId。いわゆるhwnd(ウィンドウハンドル)

  vanish: (namedId)->
    if !@namedies[namedId]? then console.error("namedId " + namedId + " is not used yet")
    @namedies[namedId].destructor()
    @namedies[namedId] = null
    delete @namedies[namedId]
    return

  named: (namedId)->
    if !@namedies[namedId]?
      console.error("namedId " + namedId + " is not used yet")
      return null
    return @namedies[namedId]

module.exports = NamedManager
