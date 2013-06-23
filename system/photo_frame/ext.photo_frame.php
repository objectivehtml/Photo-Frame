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

require 'config/photo_Frame_config.php';

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
    
    public function assets_move_file($file, $folder_row, $file_name)
    {
    	$this->EE->load->library('photo_frame_lib');
    	
	 	$asset_id   = $file->file_id();
	 	$asset_path = $file->path();    
    
	 	if($folder_row->source_type == 'ee')
	 	{
	 		$photos = $this->EE->photo_frame_model->get_photos_by_asset_id($asset_id);
	 		
	 		foreach($photos->result() as $photo)
	 		{
		 		$original_file = preg_replace('/{filedir_\d}/', '{filedir_'.$folder_row->filedir_id.'}', $photo->original_file);
		 		
		 		$this->EE->photo_frame_model->update_photo($photo->id, array(
		 			'original_file' => $original_file
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