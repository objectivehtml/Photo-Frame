<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Photo Frame
 * 
 * @package		Photo Frame
 * @author		Justin Kimbrell
 * @copyright	Copyright (c) 2012, Objective HTML
 * @link 		http://www.objectivehtml.com/photo-frame
 * @version		0.7.0
 * @build		20121031
 */

require 'config/photo_frame_config.php';


class Photo_frame_ft extends EE_Fieldtype {

	public $info = array(
		'name'			=> 'Photo Frame',
		'version'		=> PHOTO_FRAME_VERSION
	);
	
	public $matrix 				= FALSE;
	public $has_array_data 		= TRUE;
	public $safecracker			= FALSE;
	public $upload_prefs;
	
	private $default_settings	= array(
	);
	
	public $default_params = array(
		'id'              => '',
		'class'           => '',
		'alt'             => '',
		'width'           => '',
		'height'          => '',
		'dir'             => '',
		'lang'            => '',
		'title'           => '',
		'source'          => NULL, // [NULL|original]
		'parse_filenames' => 'true', // [framed|original],
		'order_by'		  => 'order',
		'sort'			  => 'asc',
		'limit' 		  => FALSE,
		'offset' 		  => 0,
		'directory_name'  => FALSE,
		'size' 			  => NULL
	);
	
	public $exclude_params = array(
		'source',
		'parse_filenames',
		'limit',
		'offset',
		'directory_name',
		'size',
		'order_by',
		'sort'
	);	

	public function __construct()
	{
		$this->EE =& get_instance();
		
		if($this->default_params['directory_name'])
		{
			$this->default_params['directory_name'] = config_item('photo_frame_directory_name');
		}
		
		if(isset($this->EE->safecracker_lib))
		{
			$this->safecracker = TRUE;
		}
			
		$this->EE->lang->loadfile('photo_frame');
					
		if(count($_FILES) > 0 && count($_POST) == 0)
		{
			$this->EE->load->library('photo_frame_lib');
			$this->EE->photo_frame_lib->upload_action();
		}	
		
		$this->EE->load->add_package_path(PATH_THIRD . 'photo_frame');
	}
	
	// --------------------------------------------------------------------
	
	/**
	 * Installs the plugin by returning the default settings array.
	 *
	 * @access	public
	 * @return	array
	 */
	 
	function install()
	{
		return $this->default_settings;
	}
	
	/**
	 * Displays the fieldtype
	 *
	 * @access	public
	 * @param 	array
	 * @return	string
	 */
	 
	public function display_cell($data)
	{
		$this->matrix = TRUE;
		
		return $this->display_field($data, $this->settings);
	}
	
	public function display_cell_settings($data)
	{
		$this->matrix = TRUE;
		
			
		return $this->display_settings($data);
	}
	
	function display_field($data)
	{	
		if(isset($this->EE->safecracker_lib))
		{
			$this->safecracker = TRUE;
		}
		
		$this->EE->load->config('photo_frame_config');
		$this->EE->load->library('photo_frame_lib');
			
		$this->EE->theme_loader->module_name = 'photo_frame';
				
		$this->EE->theme_loader->css('photo_frame');
		$this->EE->theme_loader->css('jquery.jcrop');
		$this->EE->theme_loader->javascript('photo_frame');
		$this->EE->theme_loader->javascript('jquery.ui');
		$this->EE->theme_loader->javascript('jquery.ui.widget');
		$this->EE->theme_loader->javascript('jquery.iframe-transport');
		$this->EE->theme_loader->javascript('jquery.fileupload');
		$this->EE->theme_loader->javascript('jquery.activity-indicator');
		$this->EE->theme_loader->javascript('jquery.load-image');
		$this->EE->theme_loader->javascript('jquery.jcrop');
		$this->EE->theme_loader->javascript('jquery.color');		
		
		$entry_id  = empty($data) && $data !== FALSE ? $data : ($this->EE->input->get_post('entry_id') ? $this->EE->input->get_post('entry_id') : (isset($this->EE->safecracker) ? $this->EE->safecracker->entry('entry_id') : 0));
			
			
		$uid  = $this->matrix ? md5($this->cell_name) : $this->field_name.'_wrapper';
			
		$default_settings = array(
			'photo_frame_display_info'       => 'true',
			'photo_frame_display_meta'       => 'false',
			'photo_frame_min_photos'         => 0,
			'photo_frame_max_photos'         => 0,
			'photo_frame_jpeg_compression'   => 100,
			'photo_frame_resize_max_width'   => FALSE,
			'photo_frame_resize_min_height'  => FALSE,
			'photo_frame_cropped_max_width'  => FALSE,
			'photo_frame_cropped_max_height' => FALSE,
			'photo_frame_cropped_width'      => FALSE,
			'photo_frame_cropped_height'     => FALSE,
		);
	
		$settings = array_merge($default_settings, $this->settings);
	
		$preview_styles = NULL;
		
		/*
		foreach(array('preview_width', 'preview_height') as $key)
		{
			if(!empty($settings['photo_frame_'.$key]))
			{
				$uom = '';
				
				if(!preg_match('/px|\%/', $settings['photo_frame_'.$key]))
				{
					$uom = 'px';
				}
				
				$preview_styles .= str_replace('preview_', '', $key).': '.$settings['photo_frame_'.$key] . $uom . '; ';
			}	
		}
		*/
		
		$saved_data = array();
		$new_photos = array();
		
		$new_photos_set = FALSE;
		$edit_photos_set = FALSE;
		
		if($this->matrix)
		{
			if(!empty($data) && is_array($data))
			{
				$new_photos_set  = $this->EE->photo_frame_model->has_new_photos($data);
				$edit_photos_set = $this->EE->photo_frame_model->has_edit_photos($data);
			}
		}
		elseif(isset($_POST[$this->field_name]))
		{
			$new_photos_set  = $this->EE->photo_frame_model->has_new_photos($_POST[$this->field_name]);
			$edit_photos_set = $this->EE->photo_frame_model->has_edit_photos($_POST[$this->field_name]);
		}
		
		$where = array(
			'field_id' => $this->field_id, 
			'entry_id' => $data
		);
		
		if($this->matrix && !empty($data))
		{
			unset($where['entry_id']);
			
			$where['col_id'] = $this->col_id;
			$where['row_id'] = $data;
		}
		
		$saved_data = $this->EE->photo_frame_model->get_photos(array(
			'where' => $where
		));
		
		if($saved_data->num_rows() > 0 || $new_photos_set || $edit_photos_set)
		{
			if($saved_data->num_rows() > 0)
			{
				$saved_data = $saved_data->result_array();
			}
			else
			{
				$saved_data = array();
			}
			
			$post_data = array();
			
			if($this->matrix)
			{
				$post_data = $data;
			}
			else
			{
				if(isset($_POST[$this->field_name]))
				{
					$post_data = $_POST[$this->field_name];
				}
			}
			
			if($new_photos_set)
			{
				foreach($post_data as $index => $new_photo)
				{				
					if(isset($new_photo['new']))
					{
						$new_photo = $new_photo['new'];
						
						$photo = json_decode(html_entity_decode($new_photo));
						
						if(!is_null($photo))
						{
							$photo = (array) $photo;
							$photo['new'] 		= TRUE;
							$new_photos[$index] = $photo;
							$saved_data[] 	    = $photo;
						}
					}
				}
			}
			
			if($edit_photos_set)
			{
				foreach($post_data as $index => $edit_photo)
				{
					if(isset($edit_photo['edit']))
					{
						$edit_photo = $edit_photo['edit'];
										
						$photo = json_decode(html_entity_decode($edit_photo));
						
						if(!is_null($photo))
						{
							$photo = (array) $photo;
							$photo['new'] 		 = FALSE;
							$edit_photos[$index] = $photo;
							$saved_data[] 	     = $photo;
						}
					}
				}	
			}
			
			if(count($saved_data) > 0)
			{
				$directory  = $this->EE->photo_frame_model->get_upload_group($this->settings['photo_frame_upload_group']);
				// $saved_data = $this->EE->photo_frame_model->parse_filenames($saved_data->result_array());
			
				foreach($saved_data as $index => $row)
				{
					$orig_path = $this->EE->photo_frame_model->parse($row['original_file'], 'server_path');					
					$file_path = $this->EE->photo_frame_model->parse($row['file'], 'server_path');
					
					$orig_url  = $this->EE->photo_frame_model->parse($row['original_file']);
					$file_url  = $this->EE->photo_frame_model->parse($row['file'], 'url');
					
					$new_row                       = $row;
					$new_row['saved_data']         = $row;
					$new_row['directory']          = $directory;
					$new_row['file_url']		   = $file_url;	
					$new_row['file_path']          = $file_path;
					$new_row['original_url']	   = $orig_url;
					$new_row['original_path']      = $orig_path;
					
					$saved_data[$index]            = (object) $new_row;
				}
			}
		}
		else
		{
			$saved_data = array();
		}
		
		$url      = page_url() . '&dir_id='.$settings['photo_frame_upload_group'].'&field_id='.$this->field_id;
		$crop_url = action_url('photo_frame', 'crop_action', FALSE);
		
		$min_width  = (int) $this->setting('min_width', 0);
		$min_height = (int) $this->setting('min_height', 0);
		
		$max_width  = (int) $this->setting('max_width', 0);
		$max_height = (int) $this->setting('max_height', 0);
		
		$jcrop_settings = array(
			// 'setSelect'   => $this->setting('default_location', ''),
			// 'aspectRatio' => str_replace(':', ' / ', $this->setting('aspect_ratio', NULL))
		);
		
		$default_location = $this->setting('default_location', '');
		
		if(!empty($default_location))
		{
			$default_location = explode(',', $this->setting('default_location', ''));
			
			foreach($default_location as $index => $coord)
			{
				$default_location[$index] = (float) $coord;
			}
			
			$jcrop_settings['setSelect'] = $default_location;
		}
		
		$aspect_ratio = $this->setting('aspect_ratio', NULL);
		
		if(!empty($aspect_ratio))
		{
			$aspect_ratio = explode(':', $aspect_ratio);
			
			if(!isset($aspect_ratio[1]))
			{
				$aspect_ratio[1] = 1;	
			}
			
			$jcrop_settings['aspectRatio'] 	     = (float) $aspect_ratio[0] / (float) $aspect_ratio[1];
			$jcrop_settings['aspectRatioString'] = "{$aspect_ratio[0]}:{$aspect_ratio[1]}";
		}
		
		if($min_width > 0 && $min_height > 0)
		{
			$jcrop_settings['minSize'] = array($min_width, $min_height);
			$jcrop_settings['maxSize'] = array($max_width, $max_height);
		}
		
		$directory = $this->EE->photo_frame_model->get_upload_group($this->settings['photo_frame_upload_group']);
		
		$jcrop_settings = (object) $jcrop_settings;
		
		$button_text = empty($settings['photo_frame_button_text']) ? lang('photo_frame_button_text') : $settings['photo_frame_button_text'];
		
		$instructions = empty($settings['photo_frame_instructions']) ? lang('photo_frame_instructions') : $settings['photo_frame_instructions'];
		
		$size = isset($settings['photo_frame_default_size']) && !empty($settings['photo_frame_default_size']) ? $settings['photo_frame_default_size'] : 'false';
		
		$resize 	= $this->EE->photo_frame_lib->build_size($settings, 'cropped');
		$resize_max = $this->EE->photo_frame_lib->build_size($settings, 'cropped_max');
		
		$settings_js 	= '
		
			// $(document).ready(function() {
			
				var obj = new PhotoFrame({
					fieldName: \''.($this->matrix ? $this->cell_name : $this->field_name).'\',
					fieldId: \''.$this->field_id.'\',
					photos: '.json_encode($saved_data).', 
					wrapper: typeof cell == "undefined" ? $("#'.$uid.'") : cell.dom.$td.find(\'.photo-frame-wrapper\'),
					url: \''.$url.'\',
					cropUrl: \''.$crop_url.'\',
					settings: '.json_encode($jcrop_settings).',
					directory: '.json_encode($directory).',
					infoPanel: '.$settings['photo_frame_display_info'].',
					instructions: '.json_encode($instructions).',
					size: \''.$size.'\',
					minPhotos: '.(!empty($settings['photo_frame_min_photos']) ? $settings['photo_frame_min_photos'] : 0).',
					maxPhotos: '.(!empty($settings['photo_frame_max_photos']) ? $settings['photo_frame_max_photos'] : 0).',
					showMeta: '.($settings['photo_frame_display_meta'] == 'true' ? 'true' : 'false').',
					compression: '.(!empty($settings['photo_frame_jpeg_compression']) ? $settings['photo_frame_jpeg_compression'] : 100).',
					buttonText: '.json_encode($button_text).',
					resize: '.json_encode($resize).',
					resizeMax: '.json_encode($resize_max).',
					sortable: '.(isset($settings['photo_frame_sortable']) ? $settings['photo_frame_sortable'] : 'false').'
				});
			// });
		';
		
		/*
		
		,
					resizeMaxWidth: '.(!empty($settings['photo_frame_resize_max_width']) ? $settings['photo_frame_resize_max_width'] : 'false').',
					resizeMinHeight: '.(!empty($settings['photo_frame_resize_max_height']) ? $settings['photo_frame_resize_max_height'] : 'false').'
					
					*/
				
		if($this->matrix)
		{
			$this->EE->theme_loader->output('
			Matrix.bind(\'photo_frame\', \'display\', function(cell) {
				
			// var cellName = obj.id[rowId][colId],
			
				'.$settings_js.'
				obj.options.fieldName = cell.field.id+"["+cell.row.id+"]["+cell.col.id+"]";
				
				console.log(obj);
								
			});');
			
			if($this->safecracker) {					
				$this->EE->theme_loader->output('
				$(document).ready(function() { 
					'.$settings_js.'
				});');
			}
		}
		else		
		{
			$this->EE->theme_loader->output('$(document).ready(function() {'.$settings_js.'});');
		}
		
		$total_photos = count($saved_data);
		
		$max_photos   = !empty($settings['photo_frame_max_photos']) ? $settings['photo_frame_max_photos'] : 0;
		$overlimit    = $max_photos > 0 && $max_photos <= $total_photos ? TRUE : FALSE; 
		
		$theme = FALSE;
		
		if(isset($settings['photo_frame_cp_theme']) && !empty($settings['photo_frame_cp_theme']))
		{
		    $theme = $this->EE->photo_frame_lib->get_theme($settings['photo_frame_cp_theme']);
		    
		    foreach($theme->getCss() as $file)
		    {
    		     $this->EE->theme_loader->css($file);   
		    }
		}
		
		foreach($saved_data as $index => $data)
		{
			if(isset($data->save_data['sizes']))
			{
				$data->saved_data['sizes'] = json_decode($data->saved_data['sizes']);
			}
			else
			{
				$data->saved_data['sizes'] = NULL;
			}
		}
		
		$vars = array(
			'id'             => $this->field_id,
			'safecracker'    => $this->safecracker,
			'selector'       => $uid,
			'field_label'    => $settings['field_label'],
			'field_name'     => ($this->matrix ? $this->cell_name : $this->field_name),
			'theme'          => $theme ? $theme->getWrapperClass() : '',
			'data'   	     => $saved_data,
			'new_photos'     => $new_photos,
			'preview_styles' => trim($preview_styles),
			'button_text'	 => $button_text,
			'overlimit'	 	 => $overlimit,
			'upload_helper'	 => isset($settings['photo_frame_upload_helper']) ? $settings['photo_frame_upload_helper'] : '',
			'sortable'       => (isset($settings['photo_frame_sortable'])  && $settings['photo_frame_sortable'] == 'true'? TRUE : FALSE)
		);
		
		return $this->EE->load->view('fieldtype', $vars, TRUE);
	}
	
	public function replace_original($data, $params = array(), $tagdata)
	{
		$params['source']         = 'original';
		
		return $this->replace_tag($data, $params, $tagdata);
	}
	
	public function replace_thumbs($data, $params = array(), $tagdata)
	{
		$params['directory_name'] = '_thumbs';
		$params['source']         = 'original';

		return $this->replace_tag($data, $params, $tagdata);
	}
	
	public function pre_process($data)
	{
		$this->EE->load->model('file_upload_preferences_model');
		$this->upload_prefs = $this->EE->file_upload_preferences_model->get_file_upload_preferences(NULL, NULL, TRUE);
		
		return $data;
	}
	
	public function replace_tag($data, $params = array(), $tagdata)
	{
		$this->EE->load->library('photo_frame_lib');
		
		$this->EE->load->config('photo_frame_config');
		
		if(!$params)
		{
			$params = array();	
		}
		
		$where = array(
			'field_id' => $this->field_id, 
			'entry_id' => $data
		);
		
		if(isset($this->row_id))
		{
			unset($where['entry_id']);
			
			$where['col_id'] = $this->col_id;
			$where['row_id'] = $this->row_id;
		}	
					
		$params = array_merge($this->default_params, $params);
		
		$photos = $this->EE->photo_frame_model->get_photos(array(
			'where' => $where,
			'order_by' => $params['order_by'],
			'sort'     => $params['sort'],
			'limit'    => $params['limit'],
			'offset'   => $params['offset']
		));
		
		$return = array();
		
		if($tagdata)
		{
			foreach($photos->result_array() as $index => $row)
			{		
				if(!empty($row['sizes']))
				{
					$row['sizes'] = json_decode($row['sizes']);
					
					if(isset($row['sizes']->{$params['size']}))	
					{
						$row = array_merge($row, (array) $row['sizes']->{$params['size']});
					}
				}				
								
				$return[$index] = $row;
				$return[$index]['file'] = $this->EE->photo_frame_model->parse($row['file'], 'file', $this->upload_prefs);
				$return[$index]['original_file'] = $this->EE->photo_frame_model->parse($row['original_file'], 'file', $this->upload_prefs);
				$return[$index]['url'] = $this->EE->photo_frame_model->parse($row['file'], 'url', $this->upload_prefs);
				$return[$index]['count'] = $index + 1;
				$return[$index]['index'] = $index;
				$return[$index]['total_photos'] = $photos->num_rows();
				$return[$index]['is_first_photo'] = ($index == 0) ? TRUE : FALSE;
				$return[$index]['is_last_photo']  = ($index + 1 == $photos->num_rows()) ? TRUE : FALSE;
			}
			
			$return = $this->EE->channel_data->utility->add_prefix(isset($params['prefix']) ? $params['prefix'] : 'photo', $return);
			
			return $this->parse($return, $tagdata);
		}
		else
		{
			foreach($photos->result_array() as $index => $row)
			{
				if(!empty($row['sizes']))
				{
					$row['sizes'] = json_decode($row['sizes']);
					
					if(isset($row['sizes']->{$params['size']}))	
					{
						$row = array_merge($row, (array) $row['sizes']->{$params['size']});
					}
				}				
					
				$img = array(
					'src="'.$this->EE->photo_frame_model->parse($row['file']).'"'
				);
				
				if(empty($params['alt']))
				{
					$params['alt'] = !empty($row['title']) ? $row['title'] : $this->row['title'];
				}
				
				foreach($params as $param => $value)
				{				
					if(!empty($value) && !in_array($param, $this->exclude_params))
					{
						$img[] = $param.'="'.$value.'"';
					}
				}
				
				$return[] = '<img '.implode(' ', $img).' />';
			}
			
			return implode("\r\n", $return);
		}
	}
	
	private function _parse_filenames()
	{
		var_dump($this->upload_prefs);exit();
	}
	
	public function replace_total_photos($data, $params = array(), $tagdata)
	{		
		$this->EE->load->library('photo_frame_lib');
				
		$params = array_merge($this->default_params, $params);
				
		$where = array(
			'field_id' => $this->field_id, 
			'entry_id' => $data
		);
		
		if(isset($this->row_id))
		{
			unset($where['entry_id']);
			
			$where['col_id'] = $this->col_id;
			$where['row_id'] = $this->row_id;
		}	
			
		$photos = $this->EE->photo_frame_model->get_photos(array(
			'where' => $where,
			'order_by' => $params['order_by'],
			'sort'     => $params['sort'],
			'limit'    => $params['limit'],
			'offset'   => $params['offset']
		));
		
		return $photos->num_rows();
	}
	
	public function setting($index, $default = FALSE)
	{
		$index = 'photo_frame_'.$index;
		
		if(isset($this->settings[$index]))
		{
			return !empty($this->settings[$index]) ? $this->settings[$index] : $default;
		}
		
		return $default;
	}
	
	public function save_cell($data)
	{
		$this->matrix = TRUE;
		
		$this->save($data);
		
		unset($this->EE);
		
		if(isset($this->settings['entry_id']))
		{
			return $this->settings['entry_id'];
		}
	}
	
	public function save($data)
	{
		$this->EE->load->library('photo_frame_lib');
		
		if(is_string($data) && preg_match("/({filedir_\d})(.*\.\w*)/us", $data, $matches))
		{
			$frame_file = $matches[1].config_item('photo_frame_directory_name').'/'.$matches[2];
			
			$orig_file   = $this->EE->photo_frame_model->parse($data, 'server_path');			
			$framed_file = $this->EE->photo_frame_model->parse($frame_file, 'server_path');
					
			$post_data = array(
				array('new' => json_encode(array(
					'original_file' => $data,
					'file'          => $frame_file,
					'file_name'     => $matches[2],
					'title'         => '',
					'description'   => '',
					'keywords'      => '',
					'x'				=> '',
					'x2'			=> '',
					'y' 			=> '',
					'y2' 			=> '',
					'height'	    => ImageEditor::width($orig_file),
					'width'		    => ImageEditor::height($orig_file)
					
				))
			));
			
			if($this->matrix)
			{
				$_POST[$this->settings['field_name']][$this->settings['row_name']][$this->settings['col_name']] = $post_data;
			}
			else
			{
				$_POST[$this->field_name] = $post_data;
			}
			
			ImageEditor::init($orig_file)->duplicate($framed_file);
		}
		
		return NULL;
	}
	
	public function post_save_cell($data)
	{
		$this->matrix = TRUE;
		
		$this->post_save($data);
	}
	
	public function post_save($data)
	{	
		$this->EE->load->library('photo_frame_lib');
		
		if($this->matrix)
		{
			$settings = $this->settings;
		}
		else
		{
			$settings = unserialize(base64_decode($this->settings['field_settings']));
		}
				
		$new_photos  = array();
		$edit_photos = array();
		
		if($this->matrix)
		{
			$post = $this->EE->input->post($this->settings['field_name']);
			
			if(isset($post[$this->settings['row_name']][$this->settings['col_name']]))
			{
				$post = $post[$this->settings['row_name']][$this->settings['col_name']];
			}
			else
			{
				$post = array();
			}
		}
		else
		{
			$post = $this->EE->input->post($this->field_name, TRUE);
		}
		
		if(is_array($post))
		{
    		foreach($post as $index => $photo)
    		{
    		    if(isset($photo['new']))
    		    {
        		    $photo = (array) json_decode($photo['new']);
        		    
        		    unset($photo['new']);
        		    
        		    $photo['original_file_name'] = $photo['file_name'];
        		    $photo['site_id']  = config_item('site_id');
    				$photo['field_id'] = $this->field_id;
    			    $photo['order']    = $index;
    				$photo['entry_id'] = $this->settings['entry_id'];
    				
    				if(isset($this->settings['col_id']))
    				{
	    				$photo['col_id'] = $this->settings['col_id'];
    				}
    				
    				if(isset($this->settings['row_id']))
    				{
	    				$photo['row_id'] = $this->settings['row_id'];
    				}
    				
    				$unset = array(
    					'directory' => FALSE
    				);
    				
    				foreach($unset as $var => $rename)
    				{
    					if(isset($photo[$var]))
    					{
    						if($rename)
    						{
    							$photo[$rename] = $photo[$var];
    						}
    						
    						unset($photo[$var]);
    					}
    				}
    				
    				$new_photos[] = $photo;
    		    }
    		    
    		    if(isset($photo['edit']) && count($photo['edit']))
    		    {
        		    $photo = json_decode($photo['edit']);
        		    
        		    if($this->matrix)
        		    {
	        		    $photo->col_id = $this->settings['col_id'];
        		    }
        		    
        		    $photo->order  = $index;        		    
        		    $edit_photos[] = $photo;
    		    }
    		}
		}
		
		
		if($this->matrix)
		{		
		}
		
		if(count($new_photos) > 0)
		{    
			$this->EE->photo_frame_model->save($new_photos);
		}
		
		if(count($edit_photos) > 0)
		{    		
			$this->EE->photo_frame_model->update($edit_photos, $this->matrix);
		}
		
		if($this->matrix)
		{	
			$row_id = $this->settings['row_id'];
			$col_id = $this->settings['col_id'];
			
			$this->EE->photo_frame_model->update_cell($this->settings['row_id'], array(
				'col_id_'.$col_id => $this->settings['row_id']
			));			
		}
		else
		{
			$this->EE->photo_frame_model->update_entry($this->settings['entry_id'], array(
				'field_id_'.$this->field_id => $this->settings['entry_id']
			));
			
			$row_id = FALSE;
			$col_id = FALSE;
		}
		
		
		$this->EE->photo_frame_lib->resize_photos($this->field_id, $this->settings['entry_id'], $col_id, $row_id, $settings, $this->matrix);
		
		
		// Update data with the entry_id
			
		/*
		$channel_id = $this->EE->input->get_post('channel_id');
		
		if($this->safecracker)
		{
			$channel_id = $this->EE->safecracker->channel['channel_id'];
		}
			
		$entry = $this->
		
		$parse_vars = array(
			'channel_id' => $channel_id,
			'entry_id'   => $this->settings['entry_id'],
			'title' 	 => 
		);
		
		*/
		
		return $this->settings['entry_id'];
	}	

	public function validate_cell($data)
	{		
		$this->matrix = TRUE;
		
		return $this->validate($data);
	}
	
	public function validate($data)
	{
		$post_data = NULL;
		
		if($this->safecracker)
		{
			if(isset($_POST[$this->settings['field_name']]))
			{			
				foreach($_POST[$this->settings['field_name']] as $index => $post)
				{
					unset($_POST[$this->settings['field_name']][$index]['placeholder']);
					
					if(count($_POST[$this->settings['field_name']][$index]) == 0)
					{
						unset($_POST[$this->settings['field_name']][$index]);
					}
				}
			}
		}
		
		if($this->matrix)
		{
			if(isset($_POST[$this->settings['field_name']][$this->settings['row_name']][$this->settings['col_name']]))
			{
				$post_data = $_POST[$this->settings['field_name']][$this->settings['row_name']][$this->settings['col_name']];
			}
		}
		elseif(isset($_POST[$this->field_name]))
		{
			$post_data = $_POST[$this->field_name];	
		}
		
		$this->EE->load->library('photo_frame_lib');
				
		$min_photos    = isset($this->settings['photo_frame_min_photos']) ? (int) $this->settings['photo_frame_min_photos'] : 0;
		$max_photos    = isset($this->settings['photo_frame_max_photos']) ? (int) $this->settings['photo_frame_max_photos'] : 0;
		$total_photos  = isset($post_data) && !is_null($post_data)? count($post_data) : 0;		
		$delete_photos = $this->EE->input->post('photo_frame_delete_photos', TRUE);
			
		if(isset($delete_photos[$this->settings['field_id']]))
		{
			$delete_photos = $delete_photos[$this->settings['field_id']];
			$total_photos  = $total_photos - count($delete_photos);
			
			$this->EE->photo_frame_model->delete($delete_photos);
		}
		
		$vars = array(
			'min_photos' 	  => $min_photos,
			'max_photos'      => $max_photos,
			'max_photos_name' => $max_photos > 1 || $max_photos < 1 ? 'photos' : 'photo',
			'min_photos_name' => $min_photos > 1 || $min_photos < 1 ? 'photos' : 'photo'
		);
		
		
		//var_dump($min_photos);exit();
		
		//$this->load_tmpl();
		
		if($min_photos > 0 && $min_photos > $total_photos)
		{
			$error = $this->parse_variables(lang('photo_frame_min_photos_error'), $vars);
		}
		
		if($max_photos > 0 && $max_photos < $total_photos)
		{
			$error = $this->parse_variables(lang('photo_frame_max_photos_error'), $vars);
		}
		
		if(isset($error))
		{
			return $error;	
		}
		
		return TRUE;
	}
	
	public function parse_variables($str, $vars = array())
	{
		foreach($vars as $var => $value)
		{
			$str = preg_replace('/'.LD.'('.$var.')'.RD.'/', $value, $str);
		}
		
		return $str;
	}
	
	public function display_settings($data)
	{
		$this->EE->load->config('photo_frame_config');
		$this->EE->load->library('photo_frame_lib');
		
		$themes = array('' => 'Default');
		
		foreach($this->EE->photo_frame_lib->get_themes() as $theme)
		{
		    $themes[$theme->getName()] = $theme->getTitle();
		}
			
		require PATH_THIRD . 'photo_frame/libraries/Interface_builder/Interface_builder.php';
		
		$this->EE->theme_loader->module_name = 'photo_frame';
		$this->EE->theme_loader->javascript('InterfaceBuilder');
		
		if($this->matrix)
		{
			$this->EE->theme_loader->output('
				var IB;
				
				$(".matrix-first select").change(function() {
					if($(this).val() == "photo_frame") {
						IB = new InterfaceBuilder();
					}
				});
			');
		}
		else
		{
			$this->EE->theme_loader->output('
				var IB = new InterfaceBuilder();
			');
		}
		
		$IB = new Interface_builder();
		
		$settings = array();
		
		$resize_fields = array(
			'photo_frame_upload_group' => array(
				'label'       => 'File Upload Group',
				'description' => 'Select the file upload group you in which you want to store your photos.',
				'type'        => 'select',
				'settings' => array(
					'options' => $this->EE->photo_frame_model->upload_options()
				)
			),
			'photo_frame_jpeg_compression' => array(
				'label'       => 'Image Compression (JPEG Only)',
				'description' => 'Enter an integer 1-100 with 100 being the best quality.',
				'type'        => 'input'
			),
			'photo_frame_resize_max_width' => array(
				'label'       => 'Resize Uploaded Photo (Max Width)',
				'description' => 'If the uploaded photo\'s width is greater than its height and is greater than the defined value, it will be scaled down to the defined width <i>before</i> it is uploaded.',
				'type'        => 'input'
			),
			'photo_frame_resize_max_height' => array(
				'label'       => 'Resize Uploaded Photo (Max Height)',
				'description' => 'If the uploaded photo\'s height is greater than its width and is greater than the defined value, it will be scaled down to the defined height <i>before</i> it is uploaded.',
				'type'        => 'input'
			),
			'photo_frame_cropped_sizes' => array(
				'label'       => 'Resize Cropped Photo Sizes',
				'description' => 'Resize the cropped photos to the defined sizes by defining a name, height, and width. Note, if multiple sizes are defined, then multiple images will be created. If a width or height isn\' set, then the image will be scaled to the defined dimension.',
				'type'        => 'matrix',
				'settings' => array(
					'columns' => array(
						0 => array(
							'name'  => 'name',
							'title' => 'Name'
						),
						1 => array(
							'name'  => 'width',
							'title' => 'Width'	
						),
						2 => array(
							'name'  => 'height',
							'title' => 'Height'
						),
					),
					'attributes' => array(
						'class'       => 'mainTable padTable',
						'border'      => 0,
						'cellpadding' => 0,
						'cellspacing' => 0
					)
				)			
			),
			'photo_frame_name_format' => array(
				'label'       => 'Filename Format',
				'description' => 'If a format is defined, the variables will be parsed to create a dynamic filename which will override the default.<br><br>Available Variables: <i>{channel_id}, {entry_id}, {title}, {url_title}, {filename}, {extension}, {name}, {width}, {height}, {random_alpha}, {random_alnum}, {random_numeric}, {random_string}, {random_nozero}, {random_unique}, {random_sha1}</i>',
				'type'        => 'input'
			)
		);
		
		$crop_fields = array(			
			'photo_frame_min_photos' => array(
				'label'       => 'Minimum Number of Photos',
				'description' => 'If defined, you can mandate a minimum number of photos that a user must upload. If no minimum is desired, use the default value of <i>0</i>.',
				'type'        => 'input'
			),
			'photo_frame_max_photos' => array(
				'label'       => 'Maximum Number of Photos',
				'description' => 'If defined, you can mandate a maxmimum number of photos that a user can upload. If no maximum is desired, use the default value of <i>0</i>.',
				'type'        => 'input'
			),
			/*
			'photo_frame_preview_width' => array(
				'label' => 'Preview Width',
				'description' => ''
			),
			'photo_frame_preview_height' => array(
				'label' => 'Preview Height',
				'description' => ''
			),
			*/
			'photo_frame_min_width' => array(
				'label' => 'Photo Min Width',
				'description' => 'Values should be numerical and in pixels.'
			),
			'photo_frame_min_height' => array(
				'label' => 'Photo Min Height',
				'description' => 'Values should be numerical and in pixels.'
			),
			'photo_frame_max_width' => array(
				'label' => 'Photo Max Width',
				'description' => 'Values should be numerical and in pixels.'
			),
			'photo_frame_max_height' => array(
				'label' => 'Photo Max Height',
				'description' => 'Values should be numerical and in pixels.'
			),
			'photo_frame_aspect_ratio' => array(
				'label'       => 'Photo Aspect Ratio',
				'description' => 'Enter any desired aspected ration like: 1:1, 1:2, or 4:3. Aspect ratios are <i>width:height</i>'
			),
			'photo_frame_default_location' => array(
				'label' 	  => 'Default Crop Location',
				'description' => 'There should be four coordinates, each represented in pixels which place each corner of the crop utility. If left blank, the crop utility will not display by default. <i>Format: x1, y1, x2, y2</i>'
			),
			'photo_frame_default_size' => array(
				'label' 	  => 'Default Crop Size',
				'description' => 'Define a default height and width that will be used to center the crop utility within the photo. Ex: <i>400x300</i>',
			)
		);
		
		$info_fields = array(
			'photo_frame_cp_theme' => array(
				'label'       => 'Control Panel Theme',
				'description' => 'If you want change the default theme, select one from the list.',
				'type'        => 'select',
				'settings' => array(
					'options' => $themes
				)
			),
			'photo_frame_sortable' => array(
				'label'       => 'Enable Photo Sorting',
				'description' => 'If you want to disallow the user to reorder the photos with drag and drop select FALSE.',
				'type'        => 'select',
				'settings' => array(
					'options' => array(
						'true'  => 'True',
						'false' => 'False'
					)
				)
			),
			'photo_frame_display_meta' => array(
				'label'       => 'Display Meta on Save',
				'description' => 'If you want the meta dialog will always prompt the user before the photo is saved, then choose <i>true</i>.',
				'type'        => 'select',
				'settings' => array(
					'options' => array(
						'true'  => 'True',
						'false' => 'False'
					)
				)
			),
			'photo_frame_display_info' => array(
				'label'       => 'Display Info Panel',
				'description' => 'If you want to display coordinates, image size, and aspect ratio, then choose <i>true</i>.',
				'type'        => 'select',
				'settings' => array(
					'options' => array(
						'true'  => 'True',
						'false' => 'False'
					)
				)
			),
			'photo_frame_button_text' => array(
				'label' 	  => 'Button Text',
				'description' => 'Override the default button text. If no value is present the default text will be used.'
			),
			'photo_frame_instructions' => array(
				'label' 	  => 'Instructions',
				'description' => 'Override the default instruction text. If no value is present the default instructions will be used.',
				'type'		  => 'textarea',
			),
			'photo_frame_upload_helper' => array(
				'label' 	  => 'Upload Helper',
				'description' => 'You have add additional instructions below the upload button to instruct users about file types and/or sizes (for example). Otherwise, use this field as you wish.',
				'type'		  => 'textarea',
			)
		);
		
		$vars = array(
			'matrix' 	   => $this->matrix,
			'resize_table' => $IB->table($resize_fields, $data, array(
				'class'       => $this->matrix ? 'matrix-col-settings' : 'mainTable padTable',
				'border'      => 0,
				'cellpadding' => 0,
				'cellspacing' => 0
			)),
			'crop_table' => $IB->table($crop_fields, $data, array(
				'class'       => $this->matrix ? 'matrix-col-settings' : 'mainTable padTable',
				'border'      => 0,
				'cellpadding' => 0,
				'cellspacing' => 0
			)),
			'info_table' => $IB->table($info_fields, $data, array(
				'class'       => $this->matrix ? 'matrix-col-settings' : 'mainTable padTable',
				'border'      => 0,
				'cellpadding' => 0,
				'cellspacing' => 0
			))
		);
		
		return $this->EE->load->view('settings', $vars, TRUE);
	}
	
	public function delete($ids)
	{
		$this->EE->load->library('photo_frame_lib');
		
		$this->EE->photo_frame_model->delete_entries($ids);
	}
	
	/**
	 * Saves the settings
	 *
	 * @access	public
	 * @param 	array
	 * @return	array
	 */
	 
	function save_settings($data)
	{
		return $data;
	}
	
	
	private function bool_param($param)
	{
		$param = strtolower($param);
		
		if(preg_match('/true|t|yes|y|1/', $param) || $param === TRUE)
		{
			return TRUE;
		}
		
		return FALSE;
	}
		
	private function parse($vars, $tagdata = FALSE)
	{
		if($tagdata === FALSE)
		{
			$tagdata = $this->EE->TMPL->tagdata;
		}
			
		return $this->EE->TMPL->parse_variables($tagdata, $vars);
	} 
	
	private function load_tmpl()
	{		
		if(!$this->safecracker)
		{			
			require APPPATH . 'libraries/Template.php';	
			$this->EE->TMPL = new EE_Template();
		}
	}
}

// END CLASS

/* End of file ft.keywords.php */
/* Location: ./system/expressionengine/third_party/google_maps/ft.keywords.php */