$(function(){
    // 导航固定在顶部，返回顶部
    var navbar = $('#navbar');
    var navOffset = navbar.offset().top;
    var goToTop = $('.tools .go-to-top');
    $(window).scroll(function(){
        var scrollPos = $(window).scrollTop();
        if(scrollPos >= navOffset){
            navbar.addClass('navbar-fixed-top');
            goToTop.show();
        }
        else{
            navbar.removeClass('navbar-fixed-top');
            goToTop.hide();
        }
    });
    goToTop.click(function(){
        $('html,body').animate({scrollTop: 0}, 100);
    });

    // 页脚置底
    function setMainContentMinHeight(){
        var headerHeight = $('#header').outerHeight() + 20; // 20 nav margin
        var footerHeight = $('#footer').outerHeight() + 45; // 45 footer margin
        var clientHeight = $(window).height();
        $('#main').css('min-height', clientHeight-headerHeight-footerHeight);
    }
    setMainContentMinHeight();
    $(window).resize(setMainContentMinHeight);

    // 模板引擎
    var JsTmpl = function(){
        var o = this;

        o.tmplJs = 'https://cdn.bootcss.com/blueimp-JavaScript-Templates/3.11.0/js/tmpl.min.js';
        o.tmplTag = false;

        o.injectTmpl = function(){
            if(typeof(tmpl) == 'undefined' && o.tmplTag == false){
                $('body').append('<script src="' + o.tmplJs + '"></script>');
                o.tmplTag = true;
            }
        };

        o.init = o.injectTmpl;
    };
    var jsTmpl = new JsTmpl();

    // 文章搜索
    var JsonContent = function(){
        var p = this;

        p.elem = '#widget-search-results';
        p.url = $('meta[name=jsonContent]').attr('content');

        p.tmplRaw = '<ul class="search-result-list">\
                {% for(var i in o){ %}\
                    <li class="search-result-list-item">\
                        <h1 class="title"><a href="{%= o[i].permalink %}" target="_blank">{%= o[i].title %}</a></h1>\
                        <div class="excerpt">{%= o[i].excerpt.replace(/&amp;/g,\'&\').replace(/&lt;/g,\'<\').replace(/&gt;/g,\'>\').replace(/&nbsp;/g,\' \').replace(/&apos;/g,\'\\\'\').replace(/&quot;/g,\'\\"\') %}</div>\
                    </li>\
                {% } %}\
                {% if(o.length == 0){ %}\
                    <li class="search-result-list-item">nothing found</li>\
                {% } %}\
            </ul>';

        p.data = null;
        p.tmpl = null;

        p.ajax = false;
        p.timer = {
            data: null,
            tmpl: null,
            res: null
        };

        p.initTmpl = function(){
            clearTimeout(p.timer.tmpl);
            if(typeof(tmpl) == 'undefined'){
                jsTmpl.init();
                p.timer.tmpl = setTimeout(function(){
                    p.initTmpl();
                }, 500);
            }
            else{
                p.tmpl = tmpl(p.tmplRaw);
            }
        };

        p.getData = function(){
            if(p.ajax){
                return false;
            }
            else{
                p.ajax = true;
            }

            $.ajax({
                type: 'get',
                url: p.url,
                cache: true,
                dataType: 'json',
                success: function(res){
                    p.data = res;
                },
                complete: function(){
                    p.ajax = false;
                }
            });
        };

        p.doQuery = function(keyword){
            clearTimeout(p.timer.data);
            if(p.data == null){
                p.getData();
                p.timer.data = setTimeout(function(){
                    p.doQuery(keyword);
                }, 500);
            }
            else{
                var res = [];
                p.data.posts.forEach(function(post){
                    if(post.title.toLowerCase().indexOf(keyword) >=0 || post.excerpt.toLowerCase().indexOf(keyword) >= 0 || post.text.toLowerCase().indexOf(keyword) >= 0){
                        res.push(post);
                    }
                });
                p.data.pages.forEach(function(page){
                    if(page.title.toLowerCase().indexOf(keyword) >= 0 || page.excerpt.toLowerCase().indexOf(keyword) >= 0 || page.text.toLowerCase().indexOf(keyword) >= 0){
                        res.push(page);
                    }
                });
                p.showRes(res);
            }
        };

        p.showRes = function(res){
            $(p.elem).modal('show').find('.modal-body').html(p.tmpl(res));
        };

        p.init = function(){
            p.initTmpl();
            p.getData();
        };

        p.init();
    };
    var jsonContent = new JsonContent();
    $('#widget-search-form').submit(function(){
        var keyword = $('#widget-search-keyword').val().toLowerCase();
        if(keyword.length > 0){
            jsonContent.doQuery(keyword);
        }
    });

    // 显示公开项目
    // var Project = function(){
    //     var p = this;
    //
    //     p.elem = '#project-box';
    //     p.tmplRaw = '\
    //         <ul class="project-list clearfloat">\
    //           {% for(var i in o){ %}\
    //             <li class="project-list-item">\
    //               <div class="project-list-item-box clearfloat">\
    //                 <h3 class="project-name">\
    //                   <a href="{%= o[i].html_url %}" target="_blank" title="{%= o[i].name %}">{%= o[i].name %}</a>\
    //                 </h3>\
    //                 <p class="project-description" title="{%= o[i].description %}">{%= o[i].description %}</p>\
    //                 {% if(o[i].language){ %}<span class="project-language">{%= o[i].language %}</span>{% } %}\
    //                 <a class="project-icon"><i class="fa fa-code-fork" aria-hidden="true"></i>{%= o[i].forks_count %}</a>\
    //                 <a class="project-icon"><i class="fa fa-star" aria-hidden="true"></i>{%= o[i].stargazers_count %}</a>\
    //                 <a class="project-icon"><i class="fa fa-eye" aria-hidden="true"></i>{%= o[i].watchers_count %}</a>\
    //               </div>\
    //             </li>\
    //           {% } %}\
    //         </ul>';
    //
    //     p.data = [];
    //     p.tmpl = null;
    //
    //     p.ajax = false;
    //     p.timer = {
    //         data: null,
    //         tmpl: null
    //     };
    //
    //     p.initTmpl = function(){
    //         clearTimeout(p.timer.tmpl);
    //         if(typeof(tmpl) == 'undefined'){
    //             jsTmpl.init();
    //             p.timer.tmpl = setTimeout(function(){
    //                 p.initTmpl();
    //             }, 500);
    //         }
    //         else{
    //             p.tmpl = tmpl(p.tmplRaw);
    //         }
    //     };
    //
    //     p.init = function(){
    //         p.initTmpl();
    //     };
    //
    //     p.getProject = function(type, user){
    //         var funcName = type + 'Getter';
    //         if(p.hasOwnProperty(funcName)){
    //             p.data = [];
    //             p[funcName](user);
    //             p.showProject();
    //         }
    //         else{
    //             console.log('unknown type: ' + type);
    //         }
    //     };
    //
    //     p.giteeGetter = function(user){
    //         p.ajax = true;
    //         $.ajax({
    //             type: 'get',
    //             url: 'https://github.com/api/v5/users/'+user+'/repos',
    //             dataType: 'json',
    //             success: function(res){
    //                 res.forEach(function(project){
    //                     p.data.push({
    //                         name: project.name,
    //                         description: project.description,
    //                         language: project.language,
    //                         html_url: project.html_url,
    //                         watchers_count: project.watchers_count,
    //                         stargazers_count: project.stargazers_count,
    //                         forks_count: project.forks_count
    //                     });
    //                 });
    //             },
    //             complete: function(){
    //                 p.ajax = false;
    //             }
    //         });
    //     };
    //
    //     p.showProject = function(){
    //         clearTimeout(p.timer.data);
    //         if(p.ajax){
    //             p.timer.data = setTimeout(function(){
    //                 p.showProject();
    //             }, 500);
    //         }
    //         else{
    //             $(p.elem).html(p.tmpl(p.data));
    //         }
    //     };
    //
    //     p.init();
    // };
    // if(window.hasOwnProperty('hexone_projects')){
    //     var project = new Project();
    //     for(var type in window.hexone_projects){
    //         project.getProject(type, window.hexone_projects[type]);
    //         break;  // 只显示一个账号，避免重复
    //     }
    // }
});