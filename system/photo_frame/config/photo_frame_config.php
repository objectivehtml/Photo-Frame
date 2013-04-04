<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

$config['photo_frame_version'] = '0.9.102';

if(!defined('PHOTO_FRAME_VERSION'))
{
	define('PHOTO_FRAME_VERSION', $config['photo_frame_version']);
}

$config['photo_frame_directory_name']    = '_framed';
$config['photo_frame_default_size']      = 'framed';
$config['photo_frame_original_size']     = 'original';
$config['photo_frame_random_string_len'] = 8;
$config['photo_frame_extra_dir_name']    = 'photo_frame_extras';