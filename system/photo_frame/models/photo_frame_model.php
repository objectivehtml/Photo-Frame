<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Photo_frame_model extends CI_Model {
	
	public function __construct()
	{
		parent::__construct();
		
		$this->load->driver('channel_data');
	}
	
	public function get_file_upload_groups()
	{
		if(!isset($this->session->cache['photo_frame']['upload_prefs']))
		{			
			$this->load->model('file_upload_preferences_model');
				
			$groups = $this->file_upload_preferences_model->get_file_upload_preferences(NULL, NULL, TRUE);
			
			$this->session->set_cache('photo_frame', 'upload_prefs', $groups);
		}
		else
		{
			$groups = $this->session->cache['photo_frame']['upload_prefs'];
		}
		
		return $groups;
	}
	
	public function parse($string, $type = 'url', $file_uploads = FALSE)
	{
		if($string === FALSE)
		{
			return;	
		}
		
		if($type === FALSE || is_array($type))
		{
			$file_uploads = $type;
			$type         = 'url';	
		}
		
		$types = array(
			'url'         => 'url',
			'file'        => 'server_path',
			'server_path' => 'server_path',
			'path'        => 'server_path'
		);
		
		if(isset($types[$type]))
		{
			$type = $types[$type];
		}
		else
		{
			$type = 'url';
		}
		
		if(!$file_uploads)
		{
			$file_uploads = $this->get_file_upload_groups();
		}
		
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
		return $this->get_photos(array(
			'where' => array(
				'id' => $id
			)
		));
	}
	
	public function get_entry($entry_id)
	{
		if(!isset($this->channel_data))
		{
			$this->load->driver('channel_data');	
		}
		
		return $this->channel_data->get_channel_entry($entry_id);
	}
	
	public function get_entry_photos($entry_id, $site_id = FALSE, $limit = FALSE, $offset = 0, $order_by = 'order', $sort = 'asc')
	{
		if(!$site_id)
		{
			$site_id = config_item('site_id');	
		}
		
		$params = array(
			'where' => array(
				'entry_id' => $entry_id,
				'site_id'  => $site_id
			),
			'limit'    => $limit,
			'offset'   => $offset,
			'order_by' => $order_by,
			'sort'     => $sort
		);
		
		return $this->get_photos($params);
	}
	
	public function get_field_photos($field_id, $site_id = FALSE, $limit = FALSE, $offset = 0, $order_by = 'order', $sort = 'asc')
	{
		if(!$site_id)
		{
			$site_id = config_item('site_id');	
		}
		
		$params = array(
			'where' => array(
				'field_id' => $field_id,
				'site_id'  => $site_id
			),
			'limit'    => $limit,
			'offset'   => $offset,
			'order_by' => $order_by,
			'sort'     => $sort
		);
		
		return $this->get_photos($params);
	}
	
	public function get_photos($params)
	{
		if(!isset($params['order_by']))
		{
			$params['order_by'] = 'order';
		}
		
		if(!isset($params['sort']))
		{
			$params['sort'] = 'sort';
		}
		
		return $this->channel_data->get('photo_frame', $params);
	}
	
	public function update_entry($entry_id, $data)
	{
		$this->db->where('entry_id', $entry_id);
		$this->db->update('channel_data', $data);
	}
	
	public function update_cell($row_id, $data)
	{
		$this->db->where('row_id', $row_id);
		$this->db->update('matrix_data', $data);
	}
	
	public function has_new_photos($data = array())
	{
		foreach($data as $index => $row)
		{
			if(isset($row['new']))
			{
				return TRUE;
			}
		}
		
		return FALSE;
	}
	
	public function has_edit_photos($data = array())
	{
		foreach($data as $index => $row)
		{
			if(isset($row['edit']))
			{
				return TRUE;
			}
		}
		
		return FALSE;
	}
	
	public function update_photo($photo_id, $data = array())
	{
		if(count($data) == 0)
		{
			return;
		}
		
		if(isset($data['sizes']))
		{
			$data['sizes'] = json_encode($data['sizes']);
		}
		
		$this->db->where('id', $photo_id);
		$this->db->update('photo_frame', $data);	
	}
	
	public function update($data, $matrix = FALSE)
	{
		if($data)
		{
			if(!is_array($data))
			{
				$data = array($data);	
			}
			
			foreach($data as $id => $row)
			{
				if(isset($row->id))
				{
				    if(is_string($row))
				    {
					    $row = json_decode($row);
					}
					
					$row = (array) $row;
					
					if(isset($row['sizes']))
					{
						$row['sizes'] = json_encode($row['sizes']);
					}
					
					unset($row['new']);
					
					$this->db->where('id', $row['id']);
					$this->db->update('photo_frame', $row);
				}
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
	
	/*
	public function parse_filename($name, $field = 'url', $framed_dir = FALSE, $framed_dir_name = FALSE)
	{
		$parse = $this->parse_filenames(array(array('file' => $name)), $field, $framed_dir, $framed_dir_name);
		
		return $this->functions->remove_double_slashes($parse[0]->file);
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
	*/
	
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
		
		if(!$image->getImage())
		{
			$errors[] = lang('photo_frame_invalid_format');
			
			return $errors;
		}
		
		
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
				$errors[] = $this->photo_frame_lib->parse(array(
					'min_width' => $min_width
				), lang('photo_frame_min_width'));
			}
		}
		
		if(!empty($settings['photo_frame_min_height']))
		{
			$min_height = (int) $settings['photo_frame_min_height'];
			
			if($min_height > $height)
			{
				$errors[] = $this->photo_frame_lib->parse(array(
					'min_height' => $min_height
				), lang('photo_frame_min_height'));
			}
		}
				
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