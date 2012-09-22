<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Photo_frame_model extends CI_Model {
	
	public function __construct()
	{
		parent::__construct();
		
		$this->load->config('photo_frame_config');
	}
	
	public function get_settings($field_id)
	{
		$this->db->where('field_id', $field_id);
		$settings = $this->db->get('channel_fields');
		$settings = unserialize(base64_decode($settings->row('field_settings')));
		
		return $settings;
	}
	
	public function get_photo($id)
	{
		$this->db->where('id', $id);
		
		return $this->db->get('photo_frame');
	}
	
	public function get_entry_photos($entry_id, $site_id = FALSE)
	{
		if(!$site_id)
		{
			$site_id = config_item('site_id');	
		}
		
		$this->db->where('entry_id', $entry_id);
		
		return $this->db->get('photo_frame');
	}
	
	public function get_field_photos($field_id, $site_id = FALSE)
	{
		if(!$site_id)
		{
			$site_id = config_item('site_id');	
		}
		
		$this->db->where('field_id', $field_id);
		
		return $this->db->get('photo_frame');
	}
	
	public function get_photos($field_id, $entry_id, $site_id = FALSE)
	{
		if(!$site_id)
		{
			$site_id = config_item('site_id');	
		}
		
		$this->db->where('site_id', $site_id);
		$this->db->where('field_id', $field_id);
		$this->db->where('entry_id', $entry_id);
		
		return $this->db->get('photo_frame');
	}
	
	public function update_entry($entry_id, $data)
	{
		$this->db->where('entry_id', $entry_id);
		$this->db->update('channel_data', $data);
	}
	
	public function update($data)
	{
		if($data)
		{
			if(!is_array($data))
			{
				$data = array($data);	
			}
			
			foreach($data as $id => $row)
			{
				$row = json_decode($row);
				
				$this->db->where('id', $id);
				$this->db->update('photo_frame', $row);
			}
		}
	}			
	
	public function save($data)
	{
		if(count($data) > 0)
		{
			$this->db->insert_batch('photo_frame', $data);
		}
	}		
	
	public function delete($photos)
	{
		if(!is_array($photos))
		{
			$photos = array($photos);
		}
		
		foreach($photos as $photo)
		{
			$this->db->where('id', $photo);
			$this->db->delete('photo_frame');
		}
	}	
	
	public function parse_filename($name, $field = 'url', $framed_dir = FALSE, $framed_dir_name = FALSE)
	{
		$parse = $this->parse_filenames(array(array('file' => $name)), $field, $framed_dir, $framed_dir_name);
		
		return $parse[0]->file;
	}
	
	public function parse_filenames($data, $field = 'url', $framed_dir = FALSE, $framed_dir_name = FALSE)
	{
		if(!$framed_dir_name)
		{
			$framed_dir_name = config_item('photo_frame_directory_name');
		}		
		
		$file_groups = $this->db->get('upload_prefs');
		
		$vars = array();
		
		foreach($file_groups->result() as $row)
		{
			$vars['filedir_'.$row->id] = $row->$field . ($framed_dir ? $framed_dir_name . '/' : NULL);
		}
			
		foreach($data as $index => $row)
		{
			$row = (object) $row;
			
			foreach($row as $field => $value)
			{
				foreach($vars as $var => $url)
				{
					$row->$field = str_replace(LD.$var.RD, $url, $row->$field);	
					
				}				
			}
				
			$data[$index] = $row;
		}
		
		return $data;
	}
	
	public function upload_options($index_field = 'id', $name_field = 'name')
	{
		$options = array();
		
		foreach($this->get_upload_groups()->result() as $index => $value)
		{
			$options[$value->$index_field] = $value->$name_field;
		}
		
		return $options;
	}
	
	public function validate_image_size($settings = FALSE)
	{
		if(!is_array($settings))
		{		
			$field_id = $this->input->get_post('field_id');
			$settings = $this->photo_frame_model->get_settings($field_id);		
		}
		
		$image      = $_FILES['files'];
		$image_size = getimagesize($image['tmp_name']);
		$width      = $image_size[0];
		$height     = $image_size[1];
		$errors     = array();
		
		if(!empty($settings['photo_frame_min_width']))
		{
			$min_width = (int) $settings['photo_frame_min_width'];
			
			if($min_width > $width)
			{
				$errors[] = 'The image must have a minimum width of '.$min_width.'px';
			}
		}
		
		if(!empty($settings['photo_frame_min_height']))
		{
			$min_height = (int) $settings['photo_frame_min_height'];
			
			if($min_height > $height)
			{
				$errors[] = 'The image must have a minimum height of '.$min_height.'px';
			}
		}
		
		/*
		
		if(!empty($settings['photo_frame_max_width']))
		{
			$max_width = (int) $settings['photo_frame_max_width'];
			
			if($max_width < $width)
			{
				$errors[] = 'The image must have a maximum width of '.$min_width.'px';
			}
		}
		
		if(!empty($settings['photo_frame_max_height']))
		{
			$max_height = (int) $settings['photo_frame_max_height'];
			
			if($max_height < $height)
			{
				$errors[] = 'The image must have a maximum height of '.$max_height.'px';
			}
		}
		
		*/
		
		return $errors;
	}
	
	public function get_upload_group($id)
	{	
		$this->db->where('id', $id);
		
		return $this->get_upload_groups()->row();
	}
	
	public function get_upload_groups()
	{
		return $this->db->get('upload_prefs');
	}
	
}