<?php
/**
* Add controls to customizer
*
*/
if ( ! class_exists( 'TC_controls' ) ) :
  class TC_controls extends WP_Customize_Control  {
      public $type;
      public $link;
      public $title;
      public $label;
      public $buttontext;
      public $settings;
      public $hr_after;
      public $notice;
      //number vars
      public $step;
      public $min;
      public $icon;

      public function render_content()  {
        do_action( '__before_setting_control' , $this -> id );

        switch ( $this -> type) {
            case 'hr':
              echo '<hr class="czr-customizer-separator" />';
            break;


            case 'title' :
              ?>
              <?php if (isset( $this->title)) : ?>
              <h3 class="czr-customizr-title"><?php echo esc_html( $this->title); ?></h3>
              <?php endif; ?>
              <?php if (isset( $this->notice)) : ?>
              <i class="czr-notice"><?php echo $this -> notice ?></i>
             <?php endif; ?>

            <?php
            break;

            case 'select':
              if ( empty( $this->choices ) )
                return;
              ?>
              <?php if (!empty( $this->title)) : ?>
                <h3 class="czr-customizr-title"><?php echo esc_html( $this->title); ?></h3>
              <?php endif; ?>
              <label>
                <span class="customize-control-title"><?php echo $this->label; ?></span>
                <?php $this -> hu_print_select_control( '' ) ?>
                <?php if(!empty( $this -> notice)) : ?>
                  <span class="czr-notice"><?php echo $this -> notice ?></span>
                <?php endif; ?>
              </label>
              <?php

            break;


            case 'number':
              ?>
              <?php if (isset( $this->title)) : ?>
                <h3 class="czr-customizr-title"><?php echo esc_html( $this->title); ?></h3>
              <?php endif; ?>
              <label>
                <span class="czr-number-label customize-control-title"><?php echo $this->label ?></span>
                <input <?php $this->link() ?> type="number" step="<?php echo $this-> step ?>" min="<?php echo $this-> min ?>" id="posts_per_page" value="<?php echo $this->value() ?>" class="czr-number-input small-text">
                <?php if(!empty( $this -> notice)) : ?>
                  <span class="czr-notice"><?php echo $this-> notice ?></span>
                <?php endif; ?>
              </label>
              <?php
              break;

            case 'checkbox':
              ?>
              <?php if (isset( $this->title)) : ?>
                <h3 class="czr-customizr-title"><?php echo esc_html( $this->title); ?></h3>
              <?php endif; ?>
              <?php
                    printf('<div class="czr-check-label"><label><span class="customize-control-title">%1$s</span></label></div>',
                    $this->label
                  );
              ?>
              <input <?php $this->link(); ?> type="checkbox" value="<?php echo esc_attr( $this->value() ); ?>"  <?php hu_checked( $this->value() ); ?> />

              <?php if(!empty( $this -> notice)) : ?>
               <span class="czr-notice"><?php echo $this-> notice ?></span>
              <?php endif; ?>
              <?php
            break;

            case 'textarea':
              ?>
              <?php if (isset( $this->title)) : ?>
                <h3 class="czr-customizr-title"><?php echo esc_html( $this->title); ?></h3>
              <?php endif; ?>
              <label>
                <span class="customize-control-title"><?php echo $this->label; ?></span>
                <?php if(!empty( $this -> notice)) : ?>
                  <span class="czr-notice"><?php echo $this-> notice; ?></span>
                <?php endif; ?>
                <textarea class="widefat" rows="3" cols="10" <?php $this->link(); ?>><?php echo esc_html( $this->value() ); ?></textarea>
              </label>
              <?php
              break;

            case 'url':
            case 'email':
              ?>
              <?php if (isset( $this->title)) : ?>
              <h3 class="czr-customizr-title"><?php echo esc_html( $this->title); ?></h3>
              <?php endif; ?>
              <?php
              printf('<label><span class="customize-control-title %1$s">%2$s</span><input type="text" value="%3$s" %4$s /></label>',
                ! empty( $this -> icon) ? $this -> icon : '',
                $this->label,
                call_user_func( array( TC_utils_settings_map::$instance, 'hu_sanitize_' . $this -> type), $this->value() ),
                call_user_func( array( $this, 'get'.'_'.'link' ) )
              );
              break;


            default:
              global $wp_version;
              ?>
              <?php if (isset( $this->title)) : ?>
                <h3 class="czr-customizr-title"><?php echo esc_html( $this->title); ?></h3>
              <?php endif; ?>
              <label>
                <?php if ( ! empty( $this->label ) ) : ?>
                  <span class="customize-control-title"><?php echo $this->label; ?></span>
                <?php endif; ?>
                <?php if ( ! empty( $this->description ) ) : ?>
                  <span class="description customize-control-description"><?php echo $this->description; ?></span>;;;
                <?php endif; ?>
                <?php if ( ! version_compare( $wp_version, '4.0', '>=' ) ) : ?>
                  <input type="<?php echo esc_attr( $this->type ); ?>" value="<?php echo esc_attr( $this->value() ); ?>" <?php $this->link(); ?> />
                <?php else : ?>
                  <input type="<?php echo esc_attr( $this->type ); ?>" <?php $this->input_attrs(); ?> value="<?php echo esc_attr( $this->value() ); ?>" <?php $this->link(); ?> />
                <?php endif; ?>
                <?php if(!empty( $this -> notice)) : ?>
                  <span class="czr-notice"><?php echo $this-> notice; ?></span>
                <?php endif; ?>
              </label>
              <?php
            break;
          }//end switch
          do_action( '__after_setting_control' , $this -> id );
     }//end function




    private function hu_print_select_control($class) {
      printf('<select %1$s class="%2$s">%3$s</select>',
        call_user_func( array( $this, 'get'.'_'.'link' ) ),
        $class,
        $this -> hu_get_select_options()
      );
    }


    private function hu_get_select_options() {
      $_options_html = '';
      switch ( $this -> id ) {
        default:
          foreach ( $this->choices as $value => $label ) {
            $_options_html .= sprintf('<option value="%1$s" %2$s>%3$s</option>',
              esc_attr( $value ),
              selected( $this->value(), $value, false ),
              $label
            );
          }
        break;
      }//end switch
      return $_options_html;
    }//end of fn

  }//end of class
endif;