/**
 * Created by skipp on 9/10/14.
 */

/*jslint browser: true*/
/*global $, jQuery, alert*/

var inlineEdit =  {
    edit: function (obj, selector, type) {
        "use strict";
        var html = obj.innerHTML;
        obj.innerHTML = '<input type="' + type + '" value="' + html + '">';
        $(obj).addClass(selector + '-edit');
        $(obj).removeClass(selector);
        $(obj).children('input').focus();
    },
    exit: function (obj, selector) {
        "use strict";
        $(obj.parentElement).removeClass(selector + '-edit');
        $(obj.parentElement).addClass(selector);
        var par = obj.parentElement.parentElement, fields = [], values = [], data = [], i, table_name;
        obj.parentElement.innerHTML = obj.value;
        $(par).children('td').each(function (i, j) {
            var c = $(j).attr('class').split(' '),
                head = c.filter(function (e) {
                    return e.startsWith('head');
                });
            fields.push(head.map(function (e) {
                return e.substring('head-'.length);
            })[0]);
            values.push($(j).val() || $(j).html());
        });

        for (i in fields) {
            if (fields.hasOwnProperty(i)) {
                data.push({name: fields[i], value: values[i]});
            }
        }

        table_name = $(par).parent('tbody')[0].attributes['data-table-name'].value;
        data.push({name: 'table_name', value: table_name});
        $.ajax({
            url: '/post/row/',
            type: 'post',
            dataType: 'json',
            data: data,
            complete: function (data) {
                window.console.log(data);
            }
        });
    },
    remove: function (obj, selector) {
        "use strict";
        if (window.confirm('Delete row?')) {
            var par = obj.parentElement,
                table_name = $(par).parent('tbody')[0].attributes['data-table-name'].value,
                id = $(par).children('td.head-id').html();
            $.ajax({
                url: '/delete/row/',
                type: 'post',
                dataType: 'json',
                data: {
                    table_name: table_name,
                    id: id
                },
                complete: function (data) {
                    window.console.log(data);
                }
            });
            par.remove();
        }
        return false;
    }
};

function handle_table(href) {
    "use strict";
    var table_name = href.replace('#table-', '');
    $.ajax({
        url: '/get/table/',
        type: 'get',
        dataType: 'json',
        data: {
            table_name: table_name
        },
        complete: function (data) {
            var form = '<fieldset><legend>Добавить</legend><form action="/create/' + table_name + '/" class="form">',
                result = '<thead><tr><td>id</td>',
                header = ['id'],
                types = ['id'];
            $.each(data.responseJSON.header, function (i, col) {
                result += '<td>' + col.title + '</td>';
                var type = '',
                    value = '',
                    date = new Date();
                switch (col.type) {
                case 'int':
                    type = 'number';
                    break;
                case 'date':
                    type = 'date';
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
                var h, head, title;
                result += '<tr>';
                for (h in header) {
                    if (header.hasOwnProperty(h)) {
                        head = header[h];
                        title = "Click here to edit";
                        if (types[h] === "id") {
                            title = "Click here to delete";
                        }

                        result += '<td title="' + title + '" class="head-' + head + ' type-' + types[h] + '">' + col[head] + '</td>';
                    }
                }
                result += '</tr>';
            });
            result += '</tbody>';
            $('.table-data').html(result);
            $('.fieldset-data').html(form);
        }
    });
}

function handle_hash() {
    "use strict";
    var hash = window.location.hash;
    if (hash.startsWith('#table-')) {
        handle_table(hash);
    }
}

if (typeof String.prototype.startsWith !== 'function') {
    // see below for better implementation!
    String.prototype.startsWith = function (str) {
        "use strict";
        return this.indexOf(str) === 0;
    };
}

$(function () {
    "use strict";
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