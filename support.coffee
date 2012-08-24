class @Renderer
  constructor: (@table, @input) ->
    @table.hide()
    @draw()
  draw_done: (final) ->
    @table.show()
    Textual.scrollToBottomOfView()
    @cap_link_width()
    @setup_cap_links() if final
  draw: ->
    @drawing = true
    @decay ||= 25
    lines = @input.find("table tr.line")
    lines.each (i, o) =>
      num=o.id.replace("line","")
      num=parseInt(num)
      @message(num)
    if lines.length > 0
      @draw_done()
    @decay *= 2
    unless @decay > 6400
      setTimeout () =>
        @draw()
      , @decay
    else
      @drawing = false
      @draw_done(true)
  
  # support
  setup_cap_links: ->
    setTimeout @cap_link_width, 30000
    window.addEventListener "resize", @cap_link_width
  cap_link_width: -> 
    `var width, column, style_fixes;
    column=$("tr:first-child td",this.table).first();
    // if we have any columns in the table, use those
    if (column.length!=0) {
      // use offsetWidth to avoid needing the full jquery library
      width=$(window).width()-column[0].offsetWidth;
      width=Math.ceil(width*0.85);
    } else {
      width=Math.ceil($(window).width()*0.6); }
    if (width==0)
      width = 200;
    // look for our fixes stylesheet
    style_fixes=$("head style#fixes");
    if (style_fixes.length==0) // if we can't find it then, create it
      style_fixes=$("<style id='fixes'>").appendTo($("head"));    
    css="table.bf td.msg a { max-width:" + width + "px; }\n";
    css+="table.bf { max-width: " + $(window).width() + "px }";
    style_fixes.html(css)`
    null
    
  # individual line type routines
  time: (s) ->
    ts = new Date
    if @last_time
      diff=(ts-@last_time)/1000/60; # minutes
    # if a new window or haven't printed a timestamp in the past 5 minutes
    if @last_time or diff > 5
      row = $("<tr class='time'><td></td><td>" + time + "</td></tr>")
      # nick doesn't count as a repeat if a timestamp separates it
      Bonfire.last_nick = null
      @table.append row
      @last_time = ts
  message: (lineNumber) ->
    row = @input.find("#line#{lineNumber}")

    # HACK - keep trying until we have it
    unless row[0]
      console.warn "missing #{lineNumber}, retrying"
      setTimeout () =>
        @message(lineNumber)
      ,50
      return
      
    # HACK - sometimes mark is not added to the DOM when historyIndicatorAddedToView is called
    # we'll just try and remove it every time
    @input.find("div#mark").remove();

    # tr -> tbody -> table
    row.parent().parent().remove()

    # render time
    time = row.find("span.time")
    @time time.html()
    # time.html("line#" +lineNumber);
    time.remove()

    # hide same nick in a row
    sender = row.find("span.sender")
    nick = sender.attr("nick")
    if nick and nick != Bonfire.last_nick
      Bonfire.last_nick = nick
    else 
      sender.remove()

    @table.append row
    # window.console.log("after move");
    
  set_mark: ->
    # look for the div mark
    mark = @input.find("div#mark")
    console.error "missing the mark" if mark[0]==null
    mark.remove()
    $("#mymark").remove();
    # and create our own row mark
    row = $("<tr>").attr("id","mymark");
    col = $("<td colspan='2'></td>").appendTo(row);
    @table.append(row);