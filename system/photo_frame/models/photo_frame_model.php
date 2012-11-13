<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Photo_frame_model extends CI_Model {
	
	public function __construct()
	{
		parent::__construct();
	}
	
	public function get_file_upload_groups()
	{
		if(!isset($this->session->cache['photo_frame']['upload_prefs']))
		{			
			$groups = $this->db->get('upload_prefs')->result_array();
			
			$this->session->set_cache('photo_frame', 'upload_prefs', $groups);
		}
		else
		{
			$groups = $this->session->cache['photo_frame']['upload_prefs'];
		}
		
		return $this->channel_data->utility->reindex('id', $groups);
	}
	
	public function parse_file($string, $type = 'url')
	{
		$file_uploads = $this->get_file_upload_groups();
		
		preg_match("/".LD."filedir_(\d*)".RD."/", $string, $matches);
		
		$tag = $matches[0];
		$id  = $matches[1];
		
		return str_replace($tag, $file_uploads[$id][$type], $string);		
	}
	
	public function delete_entries($ids = array(), $field_id = FALSE)
	{
		foreach($ids as $id)
		{
			if($field_id)
			{
				$this->db->where('field_id', $field_id);	
			}
			
			$this->db->where('entry_id', $id);
			$this->db->delete('photo_frame');
		}
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
	
	public function get_entry($entry_id)
	{
		if(!isset($this->channel_data))
		{
			$this->load->driver('channel_data');	
		}
		
		return $this->channel_data->get_channel_entry($entry_id);
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
	
	public function update_photo($field_id, $entry_id, $data = array())
	{
		if(count($data) == 0)
		{
			return;
		}
		
		if(isset($data['sizes']))
		{
			$data['sizes'] = json_encode($data['sizes']);
		}
		
		$this->db->where('field_id', $field_id);
		$this->db->where('entry_id', $entry_id);
		$this->db->update('photo_frame', $data);	
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
				$row = (array)json_decode($row);
		
				$row['id'] = $id;
				
				$this->db->where('id', $row['id']);
				$this->db->update('photo_frame', $row);
			}
		}
	}			
	
	public function save($data)
	{
		if(count($data) > 0)
		{
			foreach($data as $index => $value)
			{
				$new_row = $data[$index];
				unset($new_row['new']);
				$data[$index] = $new_row;
			}
			
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
		
		$image      = new ImageEditor($_FILES['files']['tmp_name']);
		$width      = $image->getWidth();
		$height     = $image->getHeight();
		$gcd	    = $width > $height ? 'width' : 'height';
		$errors     = array();
		$resize     = FALSE;
		
		$resizeMaxWidth  = isset($settings['photo_frame_resize_max_width']) &&
						   !empty($settings['photo_frame_resize_max_width']) ? 
						   (int) $settings['photo_frame_resize_max_width'] : false;
						   		
		$resizeMaxHeight  = isset($settings['photo_frame_resize_max_height']) &&
						   !empty($settings['photo_frame_resize_max_height']) ? 
						   (int) $settings['photo_frame_resize_max_height'] : false;
		
		if($resizeMaxWidth && $width > $resizeMaxWidth && ($gcd == 'width' || $resizeMaxHeight == 0))
		{	
			$image->resizeToWidth($resizeMaxWidth);
		}		
			   
		if($resizeMaxHeight && $height > $resizeMaxHeight && ($gcd == 'height' || $resizeMaxWidth == 0))
		{
			$image->resizeToHeight($resizeMaxHeight);
		}
		
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