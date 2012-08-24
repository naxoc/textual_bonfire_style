// Generated by CoffeeScript 1.3.3
(function() {

  this.Renderer = (function() {

    function Renderer(table, input) {
      this.table = table;
      this.input = input;
      this.table.hide();
      this.draw();
    }

    Renderer.prototype.draw_done = function(final) {
      this.table.show();
      Textual.scrollToBottomOfView();
      this.cap_link_width();
      if (final) {
        return this.setup_cap_links();
      }
    };

    Renderer.prototype.draw = function() {
      var lines,
        _this = this;
      this.drawing = true;
      this.decay || (this.decay = 25);
      lines = this.input.find("table tr.line");
      lines.each(function(i, o) {
        var num;
        num = o.id.replace("line", "");
        num = parseInt(num);
        return _this.message(num);
      });
      if (lines.length > 0) {
        this.draw_done();
      }
      this.decay *= 2;
      if (!(this.decay > 6400)) {
        return setTimeout(function() {
          return _this.draw();
        }, this.decay);
      } else {
        this.drawing = false;
        return this.draw_done(true);
      }
    };

    Renderer.prototype.setup_cap_links = function() {
      setTimeout(this.cap_link_width, 30000);
      return window.addEventListener("resize", this.cap_link_width);
    };

    Renderer.prototype.cap_link_width = function() {
      var width, column, style_fixes;
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
    style_fixes.html(css);
      return null;
    };

    Renderer.prototype.time = function(s) {
      var diff, row, ts;
      ts = new Date;
      if (this.last_time) {
        diff = (ts - this.last_time) / 1000 / 60;
      }
      if (this.last_time || diff > 5) {
        row = $("<tr class='time'><td></td><td>" + time + "</td></tr>");
        Bonfire.last_nick = null;
        this.table.append(row);
        return this.last_time = ts;
      }
    };

    Renderer.prototype.message = function(lineNumber) {
      var nick, row, sender, time,
        _this = this;
      row = this.input.find("#line" + lineNumber);
      if (!row[0]) {
        console.warn("missing " + lineNumber + ", retrying");
        setTimeout(function() {
          return _this.message(lineNumber);
        }, 50);
        return;
      }
      this.input.find("div#mark").remove();
      row.parent().parent().remove();
      time = row.find("span.time");
      this.time(time.html());
      time.remove();
      sender = row.find("span.sender");
      nick = sender.attr("nick");
      if (nick && nick !== Bonfire.last_nick) {
        Bonfire.last_nick = nick;
      } else {
        sender.remove();
      }
      return this.table.append(row);
    };

    Renderer.prototype.set_mark = function() {
      var col, mark, row;
      mark = this.input.find("div#mark");
      if (mark[0] === null) {
        console.error("missing the mark");
      }
      mark.remove();
      $("#mymark").remove();
      row = $("<tr>").attr("id", "mymark");
      col = $("<td colspan='2'></td>").appendTo(row);
      return this.table.append(row);
    };

    return Renderer;

  })();

}).call(this);