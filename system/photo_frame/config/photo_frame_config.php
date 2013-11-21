<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

$config['photo_frame_version'] = '1.2.3';

if(!defined('PHOTO_FRAME_VERSION'))
{
	define('PHOTO_FRAME_VERSION', $config['photo_frame_version']);
}

/*------------------------------------------
 *	Photo Frame Base URL
 *  - Override the default current_url with
      one you define.
/* -------------------------------------- */

$config['photo_frame_base_url'] 			  = config_item('photo_frame_base_url');

$config['photo_frame_directory_name']         = config_item('photo_frame_directory_name') ? 
												config_item('photo_frame_directory_name') :
												'_framed';

$config['photo_frame_cache_directory']		  = config_item('photo_frame_cache_directory') ? 
												config_item('photo_frame_cache_directory') :
												'_cache';

$config['photo_frame_default_size']		      = config_item('photo_frame_default_size') ? 
												config_item('photo_frame_default_size') :
												'framed';

$config['photo_frame_original_size']		  = config_item('photo_frame_original_size') ? 
												config_item('photo_frame_original_size') :
												'original';

$config['photo_frame_random_string_len']	  = config_item('photo_frame_random_string_len') ? 
												config_item('photo_frame_random_string_len') :
												8;

$config['photo_frame_save_colors']		      = config_item('photo_frame_save_colors') ? 
												config_item('photo_frame_save_colors') :
												8;

$config['photo_frame_save_color_granularity'] = config_item('photo_frame_save_color_granularity') ? 
												config_item('photo_frame_save_color_granularity') :
												45;

// Dynamic caching for front-end use. (For Focal cropping)

$config['photo_frame_front_end_cache_url']	  = config_item('photo_frame_front_end_cache_url') ? 
												config_item('photo_frame_front_end_cache_url') : 
												// Replace this value here if not using a modified bootstrap
												FALSE;

$config['photo_frame_front_end_cache_path']	  = config_item('photo_frame_front_end_cache_path') ?
												config_item('photo_frame_front_end_cache_path') : 
												// Replace this value here if not using a modified bootstrap
												FALSE;

$config['photo_frame_front_end_cache_length'] = config_item('photo_frame_front_end_cache_length') ?
												config_item('photo_frame_front_end_cache_length') : 
												// Replace this value here if not using a modified bootstrap
												// Example: (3600 * 24 * 7); In seconds
												0;
/* 
 *	Define the ee() function introduced in EE 2.6
 */

if ( ! function_exists('ee'))
{
    function ee()
    {
        static $EE;
        if ( ! $EE) $EE = get_instance();
        return $EE;
    }
} 