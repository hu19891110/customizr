//@global TCParams
var czrapp = czrapp || {};

(function($, czrapp) {
      //short name for the slice method from the built-in Array js prototype
      //used to handle the event methods
      var slice = Array.prototype.slice;

      $.extend( czrapp, {
            ready            : $.Deferred(),
            instances        : {},//will store all subclasses instances
            methods          : {},//will store all subclasses methods

            //parent class constructor
            Base : function() {},

            _inherits : function( classname ) {
                  //add the class to the czrapp and sets the parent this to it
                  czrapp[classname] = function() {
                    czrapp.Base.call(this);
                  };

                  //set the classical prototype chaining with inheritance
                  czrapp[classname].prototype = Object.create( czrapp.Base.prototype );
                  czrapp[classname].prototype.constructor = czrapp[classname];
                  return czrapp;
            },


            _instanciates : function( classname) {
                  czrapp.instances[classname] = czrapp.instances[classname] || new czrapp[classname]();
                  return czrapp;
            },


            /**
             * [_init description]
             * @param  {[type]} classname string
             * @param  {[type]} methods   array of methods
             * @return {[type]} czrapp object
             */
            _init : function(classname, methods) {
                  var _instance = czrapp.instances[classname] || false;
                  if ( ! _instance )
                    return;

                  //always fire the init method if exists
                  if ( _instance.init )
                    _instance.init();

                  //fire the array of methods on load
                  _instance.emit(methods);

                  //return czrapp for chaining
                  return czrapp;
            },

            //extend a classname prototype with a set of methods
            _addMethods : function(classname) {
                  $.extend( czrapp[classname].prototype , czrapp._getMethods(classname) );
                  return czrapp;
            },

            _getMethods : function(classname) {
                  return czrapp.methods[classname] || {};
            },


            /**
            * Cache properties on Dom Ready
            * @return {[type]} [description]
            */
            cacheProp : function() {
                  $.extend( czrapp, {
                        //cache various jQuery el in czrapp obj
                        $_window         : $(window),
                        $_html           : $('html'),
                        $_body           : $('body'),
                        $_wpadminbar     : $('#wpadminbar'),
                        //various properties definition
                        localized        : TCParams || {},
                        is_responsive    : this.isResponsive(),//store the initial responsive state of the window
                        current_device   : this.getDevice()//store the initial device
                  });

                  this.cacheInnerElements();

                  return czrapp;
            },

            /**
            * Cache those jQuery elements which are inside the body
            * @return {[type]} [description]
            */
            cacheInnerElements : function() {
                  $.extend( czrapp, {
                    //cache various jQuery body inner el in czrapp obj
                    $_tcHeader       : $('.tc-header')
                  });
                  return czrapp;
            },



            /***************************************************************************
            * CUSTOM EVENTS
            * tc-resize
            ****************************************************************************/
            emitCustomEvents : function() {
                  var that = this;
                  /*-----------------------------------------------------
                  -> CUSTOM RESIZE EVENT
                  ------------------------------------------------------*/
                  czrapp.$_window.resize( function(e) {
                        var $_windowWidth     = czrapp.$_window.width(),
                            _current          = czrapp.current_device,//<= stored on last resize event or on load
                            //15 pixels adjustement to avoid replacement before real responsive width
                            _to               = that.getDevice();

                        //updates width dependant properties
                        czrapp.is_responsive  = that.isResponsive();
                        czrapp.current_device = _to;
                        czrapp.$_body.trigger( 'tc-resize', { current : _current, to : _to} );
                  } );//resize();

                  /*-----------------------------------------------------
                  - > CUSTOM REFRESH CACHE EVENT on partial content rendered (customizer preview)
                  ------------------------------------------------------*/
                  if ( 'undefined' !== typeof wp && 'undefined' !== typeof wp.customize && 'undefined' !== typeof wp.customize.selectiveRefresh ) {
                        wp.customize.selectiveRefresh.bind( 'partial-content-rendered', function( placement ) {
                              czrapp.cacheInnerElements().$_body.trigger( 'partialRefresh.czr', placement );
                        });
                  }

                  return czrapp;
            },


            //bool
            isResponsive : function() {
                  return this.matchMedia(979);
            },

            //@return string of current device
            getDevice : function() {
                  var _devices = {
                        desktop : 979,
                        tablet : 767,
                        smartphone : 480
                      },
                      _current_device = 'desktop',
                      that = this;


                  _.map( _devices, function( max_width, _dev ){
                        if ( that.matchMedia( max_width ) )
                          _current_device = _dev;
                  } );

                  return _current_device;
            },

            matchMedia : function( _maxWidth ) {
                  if ( window.matchMedia )
                    return ( window.matchMedia("(max-width: "+_maxWidth+"px)").matches );

                  //old browsers compatibility
                  $_window = czrapp.$_window || $(window);
                  return $_window.width() <= ( _maxWidth - 15 );
            },

            //@return bool
            isSelectorAllowed : function( $_el, skip_selectors, requested_sel_type ) {
                  var sel_type = 'ids' == requested_sel_type ? 'id' : 'class',
                  _selsToSkip   = skip_selectors[requested_sel_type];

                  //check if option is well formed
                  if ( 'object' != typeof(skip_selectors) || ! skip_selectors[requested_sel_type] || ! $.isArray( skip_selectors[requested_sel_type] ) || 0 === skip_selectors[requested_sel_type].length )
                    return true;

                  //has a forbidden parent?
                  if ( $_el.parents( _selsToSkip.map( function( _sel ){ return 'id' == sel_type ? '#' + _sel : '.' + _sel; } ).join(',') ).length > 0 )
                    return false;

                  //has requested sel ?
                  if ( ! $_el.attr( sel_type ) )
                    return true;

                  var _elSels       = $_el.attr( sel_type ).split(' '),
                      _filtered     = _elSels.filter( function(classe) { return -1 != $.inArray( classe , _selsToSkip ) ;});

                  //check if the filtered selectors array with the non authorized selectors is empty or not
                  //if empty => all selectors are allowed
                  //if not, at least one is not allowed
                  return 0 === _filtered.length;
            },



            /***************************************************************************
            * Event methods, offering the ability to bind to and trigger events.
            * Inspired from the customize-base.js event manager object
            * @uses slice method, alias of Array.prototype.slice
            ****************************************************************************/
            trigger: function( id ) {
                  if ( this.topics && this.topics[ id ] )
                    this.topics[ id ].fireWith( this, slice.call( arguments, 1 ) );
                  return this;
            },

            bind: function( id ) {
                  //'partial-content-rendered'
                  this.topics = this.topics || {};
                  this.topics[ id ] = this.topics[ id ] || $.Callbacks();
                  this.topics[ id ].add.apply( this.topics[ id ], slice.call( arguments, 1 ) );
                  return this;
            },

            unbind: function( id ) {
                  if ( this.topics && this.topics[ id ] )
                    this.topics[ id ].remove.apply( this.topics[ id ], slice.call( arguments, 1 ) );
                  return this;
            },



            /**
             * Load the various { constructor [methods] }
             *
             * Constructors and methods can be disabled by passing a localized var TCParams._disabled (with the hook 'tc_disabled_front_js_parts' )
             * Ex : add_filter('tc_disabled_front_js_parts', function() {
             *   return array('Czr_Plugins' => array() , 'Czr_Slider' => array('addSwipeSupport') );
             * });
             * => will disabled all Czr_Plugin class (with all its methods) + will disabled the addSwipeSupport method from the Czr_Slider class
             * @todo : check the classes dependencies and may be add a check if ( ! method_exits() )
             *
             * @param  {[type]} args [description]
             * @return {[type]}      [description]
             */
            loadCzr : function( args ) {
                  var that = this,
                      _disabled = that.localized._disabled || {};

                  _.each( args, function( methods, key ) {
                        //normalize methods into an array if string
                        methods = 'string' == typeof(methods) ? [methods] : methods;

                        //key is the constructor
                        //check if the constructor has been disabled => empty array of methods
                        if ( that.localized._disabled[key] && _.isEmpty(that.localized._disabled[key]) )
                          return;

                        if ( that.localized._disabled[key] && ! _.isEmpty(that.localized._disabled[key]) ) {
                              var _to_remove = that.localized._disabled[key];
                              _to_remove = 'string' == typeof(_to_remove) ? [_to_remove] : _to_remove;
                              methods = _.difference( methods, _to_remove );
                        }
                        try {
                              //chain various treatments
                              czrapp._inherits(key)._instanciates(key)._addMethods(key)._init(key, methods);
                        } catch( er ) {
                              czrapp.errorLog( 'loadCzr, ' + key , er );
                              return;
                        }
                  });//_.each()

                  this.ready.resolve();
                  czrapp.trigger('czrapp-ready', this);
            },//loadCzr



            //CONSOLE / ERROR LOG
            //@return [] for console method
            //@bgCol @textCol are hex colors
            //@arguments : the original console arguments
            _prettyPrintLog : function( args ) {
                  var _defaults = {
                        bgCol : '#5ed1f5',
                        textCol : '#000',
                        consoleArguments : []
                  };
                  args = _.extend( _defaults, args );

                  var _toArr = Array.from( args.consoleArguments ),
                      _truncate = function( string ){
                            if ( ! _.isString( string ) )
                              return '';
                            return string.length > 150 ? string.substr( 0, 149 ) : string;
                      };

                  //if the array to print is not composed exclusively of strings, then let's stringify it
                  //else join()
                  if ( ! _.isEmpty( _.filter( _toArr, function( it ) { return ! _.isString( it ); } ) ) ) {
                        _toArr =  JSON.stringify( _toArr );
                  } else {
                        _toArr = _toArr.join(' ');
                  }
                  return [
                        '%c ' + _truncate( _toArr ),
                        [ 'background:' + args.bgCol, 'color:' + args.textCol, 'display: block;' ].join(';')
                  ];
            },

            //Dev mode aware and IE compatible api.consoleLog()
            consoleLog : function() {
                  if ( ! czrapp.localized.isDevMode )
                    return;
                  //fix for IE, because console is only defined when in F12 debugging mode in IE
                  if ( ( _.isUndefined( console ) && typeof window.console.log != 'function' ) )
                    return;

                  console.log.apply( console, czrapp._prettyPrintLog( { consoleArguments : arguments } ) );
            },

            errorLog : function() {
                  //fix for IE, because console is only defined when in F12 debugging mode in IE
                  if ( ( _.isUndefined( console ) && typeof window.console.log != 'function' ) )
                    return;

                  console.log.apply( console, czrapp._prettyPrintLog( { bgCol : '#ffd5a0', textCol : '#000', consoleArguments : arguments } ) );
            }
      });//extend
})(jQuery, czrapp);



/*************************
* ADD BASE CLASS METHODS
*************************/
(function($, czrapp) {
      var _methods = {
            emit : function( cbs, args ) {
                  cbs = _.isArray(cbs) ? cbs : [cbs];
                  var self = this;
                  _.map( cbs, function(cb) {
                        if ( 'function' == typeof(self[cb]) ) {
                              args = 'undefined' == typeof( args ) ? Array() : args ;
                              self[cb].apply(self, args );
                              czrapp.trigger( cb, _.object( _.keys(args), args ) );
                        }
                  });//_.map
            },

            triggerSimpleLoad : function( $_imgs ) {
                  if ( 0 === $_imgs.length )
                    return;

                  $_imgs.map( function( _ind, _img ) {
                        $(_img).load( function () {
                          $(_img).trigger('simple_load');
                        });//end load
                        if ( $(_img)[0] && $(_img)[0].complete )
                          $(_img).load();
                  } );//end map
            },//end of fn

            isUserLogged     : function() {
                  return czrapp.$_body.hasClass('logged-in') || 0 !== czrapp.$_wpadminbar.length;
            },

            isCustomizing    : function() {
                  return czrapp.$_body.hasClass('is-customizing');
            },
            getDevice : function() {
                  return czrapp.getDevice();
            },
            isReponsive : function() {
                  return czrapp.isReponsive();
            },
            isSelectorAllowed: function( $_el, skip_selectors, requested_sel_type ) {
                  return czrapp.isSelectorAllowed( $_el, skip_selectors, requested_sel_type );
            }
      };//_methods{}

      $.extend( czrapp.Base.prototype, _methods );//$.extend

})(jQuery, czrapp);
