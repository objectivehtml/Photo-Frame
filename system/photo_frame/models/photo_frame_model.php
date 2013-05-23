<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Photo_frame_model extends CI_Model {
	
	public function __construct()
	{
		parent::__construct();
		
		$this->load->driver('channel_data');
	}
	
	public function get_variable($var_id)
	{
		return $this->channel_data->get('low_variables', array(
			'where' => array(
				'variable_id' => $var_id
			)
		));
	}
	
	public function get_variable_settings($var_id)
	{
		return unserialize(base64_decode($this->get_variable($var_id)->row('variable_settings')));
	}
	
	public function get_actions()
	{
		$this->load->helper('addon');
		
		$return  = array();		
		$actions = $this->channel_data->get('actions', array(
			'select' => 'action_id, method',
			'where'  => array(
				'class'  => 'Photo_frame_mcp'
			)
		));
		
		foreach($actions->result() as $action)
		{		 
			$return[$action->method] = base_page(). '?ACT='.$action->action_id;
		}
		
		return $return;
	}
	
	public function get_file_upload_groups()
	{
		if(!isset($this->session->cache['photo_frame']['upload_prefs']))
		{			
			$this->load->model('file_upload_preferences_model');
				
			if(method_exists($this->file_upload_preferences_model, 'get_file_upload_preferences'))
			{
				$groups = $this->file_upload_preferences_model->get_file_upload_preferences(NULL, NULL, TRUE);
			}
			else
			{
				$prefs = $this->file_upload_preferences_model->get_upload_preferences(NULL, NULL)->result_array();
				
				$groups = array();
				
				foreach($prefs as $pref)
				{
					$groups[$pref['id']] = $pref;
				}
			}
			
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
		
		if(!isset($matches[0]))
		{
			return $string;	
		}
		
		$tag = $matches[0];
		$id  = $matches[1];
		
		return str_replace($tag, $file_uploads[$id][$type], $string);		
	}
	
	public function delete_entries($ids = array(), $field_id = FALSE, $settings = FALSE)
	{	
		foreach($ids as $id)
		{
			if($field_id)
			{
				$this->db->where('field_id', $field_id);	
			}
			
			$photos = $this->get_entry_photos($id);
			
			$delete_photos  = array();
			$settings_array = array();
			
			foreach($photos->result() as $photo)
			{					
				$field_id = $photo->field_id;
				
				if(!isset($settings_array[$photo->field_id]))
				{
					$settings = $this->photo_frame_model->get_settings($field_id);
					
					if(isset($settings['photo_frame_delete_files']) && $settings['photo_frame_delete_files'] == 'true')
					{
						$settings_array[$field_id]  = $settings;
						$delete_photos[$field_id][] = $photo->id;	
					}
				}
						
			}
			
			foreach($delete_photos as $field_id => $photos)
			{
				if(count($photos) > 0)
				{
					$this->delete($photos, $settings_array[$field_id]);
				}
			}
		
					
			$this->db->where('entry_id', $id);
			$this->db->delete('photo_frame');
		}
	}
	
	public function file_name($string)
	{
		return $this->photo_frame_lib->filename($string);
	}
	
	public function get_original_files($orig_file)
	{
		return $this->get_photos(array(
			'where' => array(
				'site_id'       => config_item('site_id'),
				'original_file' => $orig_file
			)
		));
	}
	
	public function delete_files($original_path, $delete_raw_files = TRUE)
	{		
		$files = $this->channel_data->get('files', array(
			'where' => array(
				'site_id'  => config_item('site_id'),
				'rel_path' => $original_path 
			)
		));
		
		$file_ids = array();
		
		foreach($files->result() as $file)
		{
			$file_ids[] = $file->file_id;
		}
		
		if(count($file_ids) > 0)
		{
			$this->load->model('file_model');
			$this->file_model->delete_files($file_ids, $delete_raw_files);	
		}
		
		return $file_ids;
	}
	
	public function delete($photos, $settings = FALSE)
	{	
		if(!is_array($settings))
		{		
			$field_id = $this->input->get_post('field_id');
			$settings = $this->photo_frame_model->get_settings($field_id);		
		}
		
		if(isset($settings['photo_frame_delete_files']) && 
		   $settings['photo_frame_delete_files'] == 'true')
		{
			$file_uploads = $this->get_file_upload_groups();
			
			foreach($photos as $photo_id)
			{
				$photo = $this->get_photo($photo_id);
				
				if($photo->num_rows() > 0)
				{
					$original = $this->parse($photo->row('original_file'), 'server_path', $file_uploads);
					$framed   = $this->parse($photo->row('file'), 'server_path', $file_uploads);
					$sizes    = json_decode($photo->row('sizes'));
					
					if(is_object($sizes))
					{
						foreach((array) $sizes as $size)
						{
							$file = $this->parse($size->file, 'server_path', $file_uploads);
							
							if(file_exists($file))
							{
								unlink($file);
							}
						}
					}
					
					if($this->get_original_files($photo->row('original_file'))->num_rows() == 1)
					{			
						$this->delete_files($original);						
					}
					
					if(file_exists($framed))
					{
						unlink($framed);
					}
				}
			}
		}
		
		if(!is_array($photos))
		{
			$photos = array($photos);
		}
		
		foreach($photos as $photo)
		{
			$this->db->where('id', $photo);
			$this->db->delete('photo_frame');
			
			$this->db->where('photo_id', $photo);
			$this->db->delete('photo_frame_colors');
		}
	}
	
	public function get_settings($field_id = FALSE, $col_id = FALSE, $var_id = FALSE)
	{
		if($var_id && $var_id != 'false')
		{
			$settings = $this->get_variable_settings($var_id);
		}
		else if($col_id)
		{		
			$this->db->where('field_id', $field_id);				
			$settings = $this->db->get('matrix_cols');
			$settings = unserialize(base64_decode($settings->row('col_settings')));
		}
		else
		{
			$this->db->where('field_id', $field_id);		
			$settings = $this->db->get('channel_fields');
			$settings = unserialize(base64_decode($settings->row('field_settings')));
		}
		
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
		
		$where = array(
			'entry_id' => $entry_id,
			'site_id'  => $site_id
		);
		
		$params = array(
			'where'    => $where,
			'limit'    => $limit,
			'offset'   => $offset,
			'order_by' => $order_by,
			'sort'     => $sort
		);
		
		return $this->get_photos($params);
	}
		
	public function get_zenbu_photos($entry_id, $field_id, $site_id = FALSE, $limit = FALSE, $offset = 0, $order_by = 'field_id ASC, order ASC', $sort = '')
	{
		if(!$site_id)
		{
			$site_id = config_item('site_id');	
		}
		
		$params = array(
			'where' => array(
				'entry_id' => $entry_id,
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
	
	public function get_colors($params)
	{
		$params['select'][] = '*, TRIM(CONCAT_WS(", ", `r`, `g`, `b`)) as \'color_rgb\'';
		$params['group_by'] = 'color_rgb';
		
		if(!isset($params['order_by']))
		{
			$params['order_by'] = 'depth';
		}
		
		if(!isset($params['sort']))
		{
			$params['sort'] = 'asc';
		}
		
		return $this->channel_data->get('photo_frame_colors', $params);
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
		if(is_array($data))
		{
			foreach($data as $index => $photo)
			{
				$photo['date'] = date('Y-m-d H:i:s', time());
				$colors = $photo['colors'];
				
				unset($photo['colors']);
				unset($photo['id']);
				
				$this->db->insert('photo_frame', $photo);
				
				$photo_id = $this->db->insert_id();
				
				foreach($colors as $color_index => $color)
				{
					$color_data = array(
						'photo_id' => $photo_id,
						'site_id'  => $photo['site_id'],
						'field_id' => $photo['field_id'],
						'entry_id' => $photo['entry_id'],
						'row_id'   => 0,
						'col_id'   => 0,
						'date'     => $photo['date'],
						'depth'    => $color_index,
						'r'		   => $color->r,
						'g'		   => $color->g,
						'b'		   => $color->b,
						'average'  => isset($color->average) ? $color->average : 0,
					);
					
					if(isset($photo['row_id']))
					{
						$color_data['row_id'] = $photo['row_id'];
					}
					
					if(isset($photo['col_id']))
					{
						$color_data['col_id'] = $photo['col_id'];
					}
					
					$this->db->insert('photo_frame_colors', $color_data);
				}
			}
		}
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
	
	public function validate_image_size($file, $settings = FALSE)
	{
		if(!is_array($settings))
		{		
			$field_id = $this->input->get_post('field_id');
			$settings = $this->photo_frame_model->get_settings($field_id);		
		}
		
		if(empty($file))
		{
			return array(lang('photo_frame_no_upload'));
		}
		
		$image = new ImageEditor($file);
		
		if(!$image->getImage())
		{
			return array(lang('photo_frame_invalid_format'));
		}
	
		$width      = $image->getWidth();
		$height     = $image->getHeight();
		$gcd	    = $width > $height ? 'width' : 'height';
		$errors     = array();
		$resize     = FALSE;
		
		$resizeMaxWidth  = isset($settings['photo_frame_resize_max_width']) &&
						   !empty($settings['photo_frame_resize_max_width']) ? 
						   (int) $settings['photo_frame_resize_max_width'] : FALSE;
						   		
		$resizeMaxHeight = isset($settings['photo_frame_resize_max_height']) &&
						   !empty($settings['photo_frame_resize_max_height']) ? 
						   (int) $settings['photo_frame_resize_max_height'] : FALSE;
		
		$max_size        = isset($settings['photo_frame_max_size']) &&
						   !empty($settings['photo_frame_max_size']) ? 
						   (float) $settings['photo_frame_max_size'] * 1000000: FALSE;
		
		if($resizeMaxWidth && $width > $resizeMaxWidth && ($gcd == 'width' || $resizeMaxHeight == 0))
		{	
			$image->resizeToWidth($resizeMaxWidth);
		}		
			   
		if($resizeMaxHeight && $height > $resizeMaxHeight && ($gcd == 'height' || $resizeMaxWidth == 0))
		{
			$image->resizeToHeight($resizeMaxHeight);
		}
		
		if($max_size && $image->getSize() > $max_size)
		{	
			$errors[] = $this->photo_frame_lib->parse(array(
				'max_size' => $settings['photo_frame_max_size'].'MB'.($settings['photo_frame_max_size'] ? 's' : NULL)
			), lang('photo_frame_max_size_exceeded'));
			
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
