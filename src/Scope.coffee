$ = require("jquery")

class Scope

  constructor: (@scopeId, @shell, @balloon, @named)->
    @element = document.createElement("div")
    @currentSurface = null
    @currentBlimp = null
    @type = if @scopeId is 0 then "sakura" else "kero"

    @initDOMStructure()
    @initSurface()

  initDOMStructure: ->
    @$scope = $(@element).addClass("scope")
    @$surface = $("<div />").addClass("surface").appendTo(@$scope)
    @$surfaceCanvas = $("<canvas width='10' height='100' />") # 謎の大きさ
    .addClass("surfaceCanvas").appendTo(@$surface)
    @$blimp = $("<div />").addClass("blimp").appendTo(@$scope)

    # set default position
    # なんかissueあったような
    @$scope.css
      "bottom": "0px",
      "right": (@scopeId*240)+"px",
      left: null
      top: null
    return

  initSurface: ->
    # currentBlimpは生涯そのまま使いまわす
    @currentBlimp = @balloon.attachBlimp(@$blimp[0], @scopeId, 0)
    @surface(0) # まず要素に大きさを持たせる
    @blimp(0) # まず要素に大きさを持たせる
    @surface(-1) # そして消す
    @blimp(-1) # そして消す
    return

  destructor: ()->

  surface: (surfaceId)->
    unless surfaceId? then return @currentSurface
    if Number(surfaceId) < 0 # 数値かつ負の値なら非表示
      @$surface.hide()
      return @currentSurface
    unless @shell.hasSurface(@scopeId, surfaceId)
      console.warn("Scope#surface > ReferenceError: surfaceId", surfaceId, "is not defined")
      return @currentSurface
    @shell.detachSurface(@$surfaceCanvas[0])
    @currentSurface = @shell.attachSurface(@$surfaceCanvas[0], @scopeId, surfaceId)
    # スコープのラッパ要素をサーフェスと同じ大きさにすることで
    # バルーンの位置計算をしやすくしている
    @$scope.width(this.$surfaceCanvas[0].width)
    @$scope.height(this.$surfaceCanvas[0].height)
    @$surface.show()
    @currentSurface

  blimp: (balloonId)->
    unless balloonId? then return @currentBlimp
    if Number(balloonId) < 0 # 数値かつ負の値なら非表示
      @$blimp.hide()
      return @currentBlimp
    if balloonId?
      @$blimp.show()
      # 以後balloon位置の計算
      @$blimp.css
        top: Number(@shell.descript["#{@type}.balloon.offsety"] ||　0)
      if @currentBlimp.isBalloonLeft
        @$blimp.css
          left: Number(@shell.descript["#{@type}.balloon.offsetx"] || 0) + -1 * @$blimp.width()
      else
        @$blimp.css
          left: Number(@shell.descript["#{@type}.balloon.offsetx"] || 0) + @$surfaceCanvas[0].width
      return

  position: (obj)->
    if obj?
      @$scope.css(obj)
        "bottom": obj.bottom
        "right": obj.right
    {top, left}= @$scope.offset()
    return {
      # なんだよこの座標計算
      right:  document.body.clientWidth  - window.scrollX - left - @$surfaceCanvas.width()
      bottom: document.body.clientHeight - window.scrollY - top  - @$surfaceCanvas.height()
    }
module.exports = Scope
