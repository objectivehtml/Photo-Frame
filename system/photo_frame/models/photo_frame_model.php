<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Photo_frame_model extends CI_Model {
	
	public function __construct()
	{
		parent::__construct();
		
		$this->load->driver('channel_data');
	}
	
	public function get_directory($dir_id)
	{
		$this->load->library('filemanager');

		return $this->filemanager->directory($dir_id, FALSE, TRUE);
	}

	public function asset_folders()
	{
		$return = array();
			
		if($this->assets_installed())
		{
			$folders = $this->channel_data->get('assets_folders');
			
			if($folders->num_rows() > 0)
			{
				foreach($folders->result() as $row)
				{
					$return[$row->folder_id] = $row->folder_name;
				}
			}
		}
		
		return $return;
	}
	
	public function assets_installed()
	{				
		$this->load->config('photo_frame_config');

		// Make sure that Assets is installed
		if (isset(ee()->addons) && array_key_exists('assets', $this->addons->get_installed()))
		{
			return TRUE;
		}
		
		return FALSE;
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
		
		$http = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on' ? 'https://' : 'http://';
		$www  = preg_match('/^www./', $_SERVER['HTTP_HOST']) ? 'www.' : '';

		$return  = array();		
		$actions = $this->channel_data->get('actions', array(
			'select' => 'action_id, method',
			'where'  => array(
				'class'  => 'Photo_frame_mcp'
			)
		));
		
		$base_url = config_item('photo_frame_base_url');
		$base_url = $base_url ? $base_url : config_item('site_url') . config_item('site_index');
		$base_url = $base_url && !empty($base_url) ? $base_url : base_url();
		$base_url = !empty($base_url) ? $base_url : base_page();
		$base_url = preg_replace('/^http(s|)\:\/\//', '', $base_url);
		$base_url = preg_replace('/^www./', '', $base_url);
		$base_url = $http . $www . $base_url;

		foreach($actions->result() as $action)
		{		 
			$return[$action->method] = $base_url . '?ACT='.$action->action_id;
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
	
	public function parse($string, $type = 'url', $file_uploads = FALSE, $asset_id = FALSE)
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
				
		if($asset_id)
		{
			$string = $this->photo_frame_lib->replace_asset_subdir($asset_id, $string);
		}
		
		return reduce_double_slashes(str_replace($tag, $file_uploads[$id][$type], $string));		
	}

	public function get_grid_photos($col_id, $row_id)
	{
		return $this->get_photos(array(
			'site_id' => config_item('site_id'),
			'col_id'  => $col_id,
			'row_id'  => $row_id
  		));
	}
	
	public function delete_entries($ids = array(), $field_id = FALSE, $settings = FALSE)
	{	
		foreach($ids as $id)
		{
			if($field_id)
			{
				$this->db->where('field_id', $field_id);	
			}

			if(isset($settings['grid_field_id']))
			{
				$photos = $this->get_grid_photos($settings['col_id'], $id);
			}
			else
			{
				$photos = $this->get_entry_photos($id);
			}

			$delete_photos  = array();
			$settings_array = array();
			
			foreach($photos->result() as $photo)
			{					
				$field_id = $photo->field_id;
				
				if(!isset($settings_array[$photo->field_id]))
				{
					$settings = !$settings ? $this->photo_frame_model->get_settings($field_id) : $settings;
					
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

			if(isset($settings['grid_field_id']))
			{	
				$this->db->where('field_id', $settings['grid_field_id']);
				$this->db->where('col_id', $settings['col_id']);
			}
			else
			{
				$this->db->where('entry_id', $id);
			}

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
	
	public function delete($photos, $settings = FALSE, $is_draft = FALSE)
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
				$photo = $this->get_photo($photo_id, $is_draft);
				
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
	
	public function get_settings($field_id = FALSE, $col_id = FALSE, $var_id = FALSE, $grid_id = FALSE)
	{
		if($col_id)
		{	
			$col_id = (int) str_replace('col_id_', '', $col_id);

			if($var_id)
			{
				$this->db->where('var_id', $var_id);
			}
			else if($field_id && !empty($field_id))
			{
				$this->db->where('field_id', $field_id);				
			}

			$this->db->where('col_id', $col_id);

			$settings = $this->db->get('matrix_cols');
			$settings = unserialize(base64_decode($settings->row('col_settings')));
		}
		else if($var_id && $var_id != 'false')
		{
			$settings = $this->get_variable_settings($var_id);
		}
		else if($grid_id)
		{		
			$this->db->where('field_id', $grid_id);				
			$settings = $this->db->get('grid_columns');
			$settings = (array) json_decode($settings->row('col_settings'));
		}
		else
		{
			$this->db->where('field_id', $field_id);		
			$settings = $this->db->get('channel_fields');			
			$settings = unserialize(base64_decode($settings->row('field_settings')));
		}
		
		return $settings;
	}
	
	public function get_photo($id, $is_draft = FALSE)
	{
		$where = array(
			'id' => $id,
		);
		
		if($is_draft !== FALSE)
		{
			$where['is_draft'] = $is_draft ? 1 : 0; 
		}
		
		return $this->get_photos(array(
			'where' => $where
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
		
	public function get_zenbu_photos($entry_id, $field_id, $color = FALSE, $extra_options = array(), $site_id = FALSE, $limit = FALSE, $offset = 0, $order_by = 'exp_photo_frame.field_id ASC, color_proximity ASC', $sort = '')
	{
		$this->load->library('photo_frame_sql');
		
		if(!$site_id)
		{
			$site_id = config_item('site_id');	
		}
		
		$having = $this->photo_frame_sql->get_having($extra_options['min_proximity'], $extra_options['max_proximity'], $extra_options['min_color_depth'], $extra_options['max_color_depth']);
		
		if($color)
		{
			$this->db->join($this->photo_frame_sql->get_join($color, $having), 'photo_frame.id = photo_frame_colors.photo_id');
			$this->db->having($having);
		}
		
		$params = array(
			'select' => array(
				'exp_photo_frame.*',
				$color ? $this->photo_frame_sql->get_select($color, FALSE) : '\'0\' as \'color_proximity\'',
			),
			'where'  => array(
				'exp_photo_frame.entry_id' => $entry_id,
				'exp_photo_frame.field_id' => $field_id,
				'exp_photo_frame.site_id'  => $site_id
			),
			'group_by' => $color ? 'id' : false,
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
	
	public function get_photos_by_asset_id($asset_id)
	{
		return $this->get_photos(array(
			'where' => array(
				'asset_id' => $asset_id
			)
		));
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
	
	public function get_photo_colors($photo_id)
	{
		return $this->get_colors(array(
			'where' => array(
				'photo_id' => $photo_id
			)
		));
	}
	
	public function duplicate_photo_colors($orig_photo_id, $new_photo_id)
	{
		$colors = $this->get_photo_colors($orig_photo_id);
		
		foreach($colors->result_array() as $color)
		{
			$color['photo_id'] = $new_photo_id;
			
			unset($color['id']);
			unset($color['color_rgb']);
			
			$this->db->insert('photo_frame_colors', $color);
		}
	}
	
	public function update_draft_data($entry_id, $field_id)
	{
		$draft_data = $this->channel_data->get('ep_entry_drafts', array(
			'where' => array(
				'entry_id' => $entry_id
			)
		));
		
		if($draft_data->num_rows() == 1)
		{
			$draft_data = unserialize($draft_data->row('draft_data'));
			$draft_data['field_id_'.$field_id] = $entry_id;
			
			$this->db->where('entry_id', $entry_id);
			$this->db->update('ep_entry_drafts', array('draft_data' => serialize($draft_data)));
		}
	}
	
	public function update_entry($entry_id, $data)
	{
		$this->db->where('entry_id', $entry_id);
		$this->db->update('channel_data', $data);
	}
	
	public function update_grid($field_id, $row_id, $data)
	{
		$this->db->where('row_id', $row_id);
		$this->db->update('channel_grid_field_'.$field_id, $data);
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
				
				$photo_id = $this->insert($photo);
				
				$this->insert_colors($colors, $photo_id, $photo);
			}
		}
	}
	
	public function insert($photo)
	{
		unset($photo['id']);
		
		$this->db->insert('photo_frame', $photo);
		
		return $this->db->insert_id();	
	}
	
	public function insert_colors($colors, $photo_id, $photo)
	{
		$photo = (array) $photo;
		
		$this->db->delete('photo_frame_colors', array(
			'photo_id' => $photo_id
		));
		
		foreach($colors as $color_index => $color)
		{
			$color_data = array(
				'photo_id' => $photo_id,
				'site_id'  => $photo['site_id'],
				'field_id' => $photo['field_id'],
				'entry_id' => $photo['entry_id'],
				'row_id'   => isset($photo['row_id']) && !empty($photo['row_id']) ? $photo['row_id'] : 0,
				'col_id'   => isset($photo['col_id']) && !empty($photo['col_id']) ? $photo['col_id'] : 0,
				'var_id'   => isset($photo['var_id']) && !empty($photo['var_id']) ? $photo['var_id'] : 0,
				'date'     => $photo['date'],
				'depth'    => $color_index,
				'r'		   => $color->r,
				'g'		   => $color->g,
				'b'		   => $color->b,
				'average'  => isset($color->average) ? $color->average : 0,
			);
			
			$this->db->insert('photo_frame_colors', $color_data);
		}
	}
	
	public function has_draft($id, $settings = array())
	{
		$where = array(
			'is_draft' => 1,
			'id'       => $id
		);
		
		if(isset($settings['entry_id']))
		{
			$where['entry_id'] = $settings['entry_id'];
		}
		
		if(isset($settings['field_id']))
		{
			$where['field_id'] = $settings['field_id'];
		}
		
		if(isset($settings['row_id']))
		{
			$where['row_id'] = $settings['row_id'];
		}
		
		if(isset($settings['col_id']))
		{
			$where['col_id'] = $settings['col_id'];
		}
				
		if(isset($settings['site_id']))
		{
			$where['site_id'] = $settings['site_id'];
		}
		
		return $this->get_photos(array('where' => $where))->num_rows() == 0 ? false : true;
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
			$field_id = $this->input->get_post('field_id', TRUE);
			$grid_id  = $this->input->get_post('grid_id', TRUE);
			$settings = $this->get_settings($field_id, FALSE, FALSE, $grid_id);		
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
		
		/*
		if($resizeMaxWidth && $width > $resizeMaxWidth && ($gcd == 'width' || $resizeMaxHeight == 0))
		{	
			$image->resizeToWidth($resizeMaxWidth);
		}		
			   
		if($resizeMaxHeight && $height > $resizeMaxHeight && ($gcd == 'height' || $resizeMaxWidth == 0))
		{
			$image->resizeToHeight($resizeMaxHeight);
		}
		*/
		
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
		$this->db->where('site_id', config_item('site_id'));
		
		return $this->get_upload_groups()->row();
	}
	
	public function get_upload_groups()
	{
		$this->db->where('site_id', config_item('site_id'));
		
		return $this->db->get('upload_prefs');
	}
	
}
