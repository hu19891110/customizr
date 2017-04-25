<?php
class CZR_gallery_model_class extends CZR_Model {

      protected      $post_id;

      protected      $media;
      protected      $gallery_items;


      public         $defaults      = array(
                                          'media'           => null,
                                          'gallery_items'   => null,
                                          'post_id'         => null,
                                          'visibility'      => true,
                                          'has_lightbox'    => true,
                                    );




      /* Public api */
      public function czr_fn_setup( $args = array() ) {

            $defaults = array (

                  'post_id'         => null,
                  'has_lightbox'    => true,

            );

            $args = wp_parse_args( $args, $defaults );

            $args[ 'post_id' ]     = $args[ 'post_id' ] ? $args[ 'post_id' ] : get_the_ID();

            /* This will update the model object properties, merging the $model -> defaults too */
            $this -> czr_fn_update( $args );

            /* Set the media property */
            $this -> czr_fn__set_raw_media();

            /* Toggle visibility */
            $this -> czr_fn_set_property( 'visibility',  (bool) $this->czr_fn_get_raw_media() );

      }




      public function czr_fn_get_raw_media() {

            return $this->media;

      }




      /*
      * Fired just before the view is rendered
      * @hook: pre_rendering_view_{$this -> id}, 9999
      */
      /*
      * Each time this model view is rendered setup the current gallery items
      */
      function czr_fn_setup_late_properties() {


            if ( is_null( $this->media ) ) {
                  $this -> czr_fn_setup( array(
                        'post_id'  => $this->post_id
                  ) );
            }


            $this -> czr_fn__setup_the_gallery_items();

      }




      protected function czr_fn__set_raw_media() {

            $this -> czr_fn_set_property( 'media', $this->czr_fn__get_post_gallery() );

      }




      protected function czr_fn__setup_the_gallery_items() {

            $this -> czr_fn_set_property( 'gallery_items', $this->czr_fn__get_the_gallery_items() );

      }




      protected function czr_fn__get_the_gallery_items() {

            $raw_media       = $this -> media;

            if ( empty( $raw_media ) )
               return array();


            $gallery_items   = array();

            $_gallery_ids    = isset( $raw_media[ 'ids' ] ) ? explode( ',',  $raw_media[ 'ids' ] ) : array();

            $_index          = 0;

            foreach( $raw_media[ 'src' ] as $src ) {

                  $_original_image  = '';
                  $_alt             = '';

                  if ( isset( $_gallery_ids[ $_index ] ) ) {
                        if ( $this->has_lightbox )
                              $_original_image = wp_get_attachment_url( $_gallery_ids[ $_index ] ); //'full';

                        $_alt            = get_post_meta( $_gallery_ids[ $_index ], '_wp_attachment_image_alt', true );

                  }

                  $gallery_items[] = array(

                        'src'             => $src,
                        //lightbox
                        'data-mfp-src'    => $_original_image ? $_original_image : $src,
                        'alt'             => $_alt

                  );

                  $_index++;
            }

            return $gallery_items;

      }




      protected function czr_fn__get_post_gallery() {

            $post_id          = $this->post_id ? $this->post_id : get_the_ID();
            $post_gallery     = get_post_gallery( $post_id, false );

            return empty( $post_gallery ) ? false : $post_gallery;

      }

}