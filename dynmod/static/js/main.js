/**
 * Created by skipp on 9/10/14.
 */

var inlineEdit =  {
    edit: function (obj, selector, type) {
        var html = obj.innerHTML;
        obj.innerHTML = '<input type="' + type + '" value="' + html + '">';
        $(obj).addClass(selector + '-edit');
        $(obj).removeClass(selector);
        $(obj).children('input').focus();
    },
    exit: function (obj, selector) {
        $(obj.parentElement).removeClass(selector + '-edit');
        $(obj.parentElement).addClass(selector);
        var par = obj.parentElement.parentElement;
        obj.parentElement.innerHTML = obj.value;
        var fields = [];
        var values = [];
        $(par).children('td').each(function (i, j) {
            var c = $(j).attr('class').split(' ');
            var head = c.filter(function (e) {
                return e.startsWith('head')
            });
            fields.push(head.map(function (e) {
                return e.substring('head-'.length)
            })[0]);
            values.push($(j).val() ? $(j).val() : $(j).html());
        });
        var data = [];
        for (var i in fields) {
            data.push({name: fields[i], value: values[i]});
        }
        var table_name = $(par).parent('tbody')[0].attributes['data-table-name'].value;
        data.push({name: 'table_name', value: table_name});
        $.ajax({
            url: '/post/row/',
            type: 'post',
            dataType: 'json',
            data: data,
            complete: function (data) {
                console.log(data);
            }
        });
    },
    remove: function(obj, selector) {
        if (confirm('Delete row?')) {
            var par = obj.parentElement;
            var table_name = $(par).parent('tbody')[0].attributes['data-table-name'].value;
            var id = $(par).children('td.head-id').html();
            $.ajax({
                url: '/delete/row/',
                type: 'post',
                dataType: 'json',
                data: {
                    table_name: table_name,
                    id: id
                },
                complete: function (data) {
                    console.log(data);
                }
            });
            par.remove();
        }
        return false;
    }
};

$(function () {
    handle_hash();

    $('.table-link').on('click', function () {
        var href = $(this).attr('href');
        handle_table(href);
    });

    $(document).on('submit', '.form', function (e) {
        e.preventDefault();
        var form = $(this);
        $.get(form.attr('action'), form.serialize(), function () {
            handle_hash();
        }, "text");
    });

    $(document).on('click', 'td.type-id', function (e) {
        inlineEdit.remove(this);
    });

    $(document).on('click', 'td.type-int', function (e) {
        inlineEdit.edit(this, 'type-int', 'number');
    });
    $(document).on('focusout', 'td.type-int-edit input', function (e) {
        inlineEdit.exit(this, 'type-int');
    });

    $(document).on('click', 'td.type-char', function (e) {
        inlineEdit.edit(this, 'type-char', 'char');
    });
    $(document).on('focusout', 'td.type-char-edit input', function (e) {
        inlineEdit.exit(this, 'type-char');
    });

    $(document).on('click', 'td.type-date', function (e) {
        inlineEdit.edit(this, 'type-date', 'date');
    });
    $(document).on('focusout', 'td.type-date-edit input', function (e) {
        inlineEdit.exit(this, 'type-date');
    });

});

function handle_hash() {
    var hash = window.location.hash;
    if (hash.startsWith('#table-')) {
        handle_table(hash);
    }
}

function handle_table(href) {
    var table_name = href.replace('#table-', '');
    $.ajax({
        url: '/get/table/',
        type: 'get',
        dataType: 'json',
        data: {
            table_name: table_name
        }, complete: function (data) {
            var form = '<fieldset><legend>Добавить</legend><form action="/create/' + table_name + '/" class="form">';
            var result = '<thead><tr><td>id</td>';
            var header = ['id'];
            var types = ['id'];
            $.each(data.responseJSON.header, function (i, col) {
                result += '<td>' + col.title + '</td>';
                var type = '';
                var value = '';
                switch (col.type) {
                    case 'int':
                        type = 'number';
                        break;
                    case 'date':
                        type = 'date';
                        var date = new Date();
                        value = (date.getFullYear().toString()) + "-" + ("0" + (date.getMonth() + 1).toString()).substr(-2) + "-" + ("0" + date.getDate().toString()).substr(-2);
                        break;
                    case 'char':
                        type = 'text';
                        break;
                    default:
                        break;
                }
                header.push(col.row_name);
                types.push(col.type);

                form += '<div class="row"><label>' + col.title + '<input type="' + type + '" name="' + col.row_name + '" value="' + value + '"></label></div>';
            });

            form += '<input type="submit" class="submit" value="Добавить"></form></fieldset>';
            result += '</tr></thead><tbody data-table-name="' + table_name + '">';
            $.each(data.responseJSON.data, function (i, col) {
                result += '<tr>';
                for (var h in header) {
                    var head = header[h];
                    var title = "Click here to edit";
                    if (types[h] == "id")
                        title = "Click here to delete";

                    result += '<td title="'+title+'" class="head-' + head + ' type-' + types[h] + '">' + col[head] + '</td>';
                }
                result += '</tr>';
            });
            result += '</tbody>';
            $('.table-data').html(result);
            $('.fieldset-data').html(form);
        }
    });
}

if (typeof String.prototype.startsWith != 'function') {
    // see below for better implementation!
    String.prototype.startsWith = function (str) {
        return this.indexOf(str) == 0;
    };
}