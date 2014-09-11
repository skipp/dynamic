/**
 * Created by skipp on 9/10/14.
 */

$(function () {
    handle_hash();

    $('.table-link').on('click', function () {
        var href = $(this).attr('href');
        handle_table(href);
    });

    $(document).on('submit', '.form', function (e) {
        e.preventDefault();
        var form = $(this);
        $.get(form.attr('action'), form.serialize(), function () { handle_hash(); }, "text");
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
            $.each(data.responseJSON.header, function (i, col) {
                result += '<td>' + col.title + '</td>';
                var type = '';
                switch (col.type) {
                    case 'int':
                        type = 'number';
                        break;
                    case 'date':
                        type = 'date';
                        break;
                    case 'char':
                        type = 'text';
                        break;
                    default:
                        break;
                }
                form += '<div class="row"><label>' + col.title + '<input type="' + type + '" name="' + col.row_name + '"></label></div>';
            });

            form += '<input type="submit" class="submit" value="Добавить"></form></fieldset>';
            result += '</tr></thead><tbody>';
            $.each(data.responseJSON.data, function (i, col) {
                result += '<tr>';
                $.each(col, function (j, f) {
                    result += '<td>' + f + '</td>';
                });
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