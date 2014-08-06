<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Postmaster
 * 
 * @package		Postmaster
 * @author		Justin Kimbrell
 * @copyright	Copyright (c) 2012, Objective HTML
 * @link 		http://www.objectivehtml.com/postmaster
 * @version		1.2.0
 * @build		20121217
 */

require 'config/photo_frame_config.php';

class Photo_frame_ext {

    public $name       		= 'Photo Frame';
    public $version        	= PHOTO_FRAME_VERSION;
    public $description    	= 'Premium photo management';
    public $settings_exist 	= 'n';
  	public $docs_url       	= 'http://objectivehtml.com/photo-frame';
	public $settings 		= array();
	public $required_by 	= array('module');
	
	public $new_entry		= TRUE;
	
	public function __construct()
	{
	   	$this->EE =& get_instance();

        $this->settings = array();
    }


    public function assets_rename_file($file, $new_file_name)
    {
    	$this->EE->load->library('photo_frame_lib');
    	
	 	$subfolder  = $file->subfolder();
	 	$old_path   = '{filedir_'.$file->filedir_id().'}'.(!empty($subfolder) ? $subfolder . '/' : '').$file->filename();
	 	$new_path   = '{filedir_'.$file->filedir_id().'}'.(!empty($subfolder) ? $subfolder . '/' : '').$new_file_name;

    	$photos = $this->EE->photo_frame_model->get_photos(array(
 			'where' => array(
 				'site_id' 		=> config_item('site_id'),
 				'original_file' 	 => $old_path
 			)
 		));

 		foreach($photos->result() as $photo)
 		{
	 		$this->EE->photo_frame_model->update_photo($photo->id, array(
	 			'original_file' 	 => $new_path,
 				'original_file_name' => $new_file_name
	 		));
 		}
    }
    
    public function assets_move_file($file, $folder_row, $new_file_name)
    {
    	$this->EE->load->library('photo_frame_lib');
    	
	 	$asset_id   = $file->file_id();
	 	$asset_path = $file->path();    
	 	
	 	$subfolder  = $file->subfolder();
	 	$old_path   = '{filedir_'.$file->filedir_id().'}'.(!empty($subfolder) ? $subfolder . '/' : '').$file->filename();
	 	$new_path   = '{filedir_'.$folder_row->filedir_id.'}'.str_replace($new_file_name, '', $folder_row->full_path) . $new_file_name;
	 	
	 	if($folder_row->source_type == 'ee')
	 	{
	 		$photos = $this->EE->photo_frame_model->get_photos(array(
	 			'where' => array(
	 				'site_id' 		=> config_item('site_id'),
	 				'original_file' => $old_path
	 			)
	 		));

	 		foreach($photos->result() as $photo)
	 		{
		 		$this->EE->photo_frame_model->update_photo($photo->id, array(
		 			'original_file' => $new_path
		 		));
	 		}
	 	}
    }
			 
	/**
	 * Activate Extension
	 *
	 * This function enters the extension into the exp_extensions table
	 *
	 * @return void
	 */
	public function activate_extension()
	{	    
	    return TRUE;
	}
	
	/**
	 * Update Extension
	 *
	 * This function performs any necessary db updates when the extension
	 * page is visited
	 *
	 * @return  mixed   void on update / false if none
	 */
	public function update_extension($current = '')
	{
	    if ($current == '' OR $current == $this->version)
	    {
	        return FALSE;
	    }
	
	    if ($current < '1.0')
	    {
	        // Update to version 1.0
	    }
	
	    $this->EE->db->where('class', __CLASS__);
	    $this->EE->db->update('extensions', array('version' => $this->version));
	}
	
	/**
	 * Disable Extension
	 *
	 * This method removes information from the exp_extensions table
	 *
	 * @return void
	 */
	public function disable_extension()
	{
	    $this->EE->db->where('class', __CLASS__);
	    $this->EE->db->delete('extensions');
	}

	public function settings()
	{
		return '';
	}
		
}