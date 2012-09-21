<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

$config['photo_frame_version'] = '0.1.2';

if(!defined('PHOTO_FRAME_VERSION'))
{
	define('PHOTO_FRAME_VERSION', $config['photo_frame_version']);
}

$config['photo_frame_directory_name'] = 'framed';