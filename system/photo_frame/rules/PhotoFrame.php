<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class PhotoFrame_channel_search_rule extends Base_rule {
	
	protected $title       = 'Photo Frame';
	
	protected $description = 'The Photo Frame search modifier allows you to search the events stored within the Showtimes fieldtype.';
	
	protected $name        = 'photo_frame';
	
	protected $fields = array(
		'photo_frame_fields' => array(
			'label'       => 'Photo Frame Field Name(s)',
			'description' => 'Enter the names of the Photo Frame field you want to search. If you want to search multiple fields from the same channel, delimit the field names with a comma.',
		),	
		'form_field' => array(
			'label'       => 'Form Field Name',
			'description' => 'Enter the name form field used to pass the color to be searched.',
		),	
		'min_proximity' => array(
			'label'       => 'Min Color Proximity',
			'description' => 'This is the minimum color proximity. The color proximity is the value used to determine if a particular color is in the same proximity of the color being searched. The smaller the number the closer to an exact match the colors must be. Increase the number to make the search less strict. The default value is <b>0</b>.<br><br>Use the following equation to figure out the best threshold for you.<br><b>(R - Ri)^2 + (G - Gi)^2 + (B - Bi)^2</b>',
		),	
		'max_proximity' => array(
			'label'       => 'Maximum Color Proximity',
			'description' => 'This is the maximum color proxmity. The color proximity is the value used to determine if a particular color is in the same proximity of the color being searched. The smaller the number the closer to an exact match the colors must be. Increase the number to make the search less strict. The default value is <b>12,000</b>.<br><br>Use the following equation to figure out the best threshold for you.<br><b>(R - Ri)^2 + (G - Gi)^2 + (B - Bi)^2</b>',
		),	
		'min_color_depth' => array(
			'label'       => 'Minimum Color Depth',
			'description' => 'The color depth allows you to choose how many colors to search. This settings allows you to define the minimum depth to search. The default is <b>0</b>.',
		),	
		'max_color_depth' => array(
			'label'       => 'Maximum Color Depth',
			'description' => 'The color depth allows you to choose how many colors to search. For instance, by default Photo Frame indexes the 8 most used colors in a photo. This settings allows you to define the maximum depth to search. The default is <b>3</b>.',
		),		
		'color_index' => array(
			'label'       => 'Color Index',
			'description' => 'The color index allows you to define specific color ranges and corresponding RGB values. This color index will override the default color index, which includes the basic colors: red, orange, yellow, green, blue, purple, violet (alias for purple), white, and black.',
			'type'		  => 'matrix',
			'settings'    => array(
				'columns' => array(
					array(
						'name'  => 'color_name',
						'title' => 'Color Name'
					),
					array(
						'name'  => 'r',
						'title' => 'R',
						'width' => 50,
					),
					array(
						'name'  => 'g',
						'title' => 'G',
						'width' => 50,
					),
					array(
						'name'  => 'b',
						'title' => 'B',
						'width' => 50,
					)
				),
				'attributes' => array(
					'class'       => 'mainTable padTable',
					'border'      => 0,
					'cellpadding' => 0,
					'cellspacing' => 0
				)
			)
		),	
	);
	
	public function __construct($properties = array())
	{
		$this->EE =& get_instance();
		
		$this->EE->load->add_package_path(PATH_THIRD . 'photo_frame');
		$this->EE->load->library('photo_frame_lib');
		$this->EE->load->config('photo_frame_color_index');
		
		parent::__construct($properties);
	}
	
	public function get_vars_row($row)
	{
		$cache 	  = $this->EE->session->cache['channel_search']['search_results'];
		$response = $cache->response->result();
		
		$photos    = array();		
		$proximity = FALSE;
				
		foreach($response as $index => $data)
		{
			if($data->entry_id == $row['entry_id'])
			{	
				$photos[] = $data->photo_id;				
			}
		}
		
		$vars = array(
			'photo_ids' 	  => implode('|', $photos),
		);	
		
		return parent::get_vars_row($vars);
	}
	
	public function get_select()
	{
		$color_sql = NULL;
		$settings  = $this->get_settings();
		$rules     = $settings->rules;
		
		$color = strtolower($this->input($rules->form_field));
		$color = $this->_get_color($color, $rules);
		
		if($color)
		{
			$color = explode(',', $color);
			
			$r = $color[0];
			$g = $color[1];
			$b = $color[2];
			
			$color_sql = ', (POW('.$r.' - exp_photo_frame_colors.r, 2) + POW('.$g.' - exp_photo_frame_colors.g, 2) + POW('.$b.' - exp_photo_frame_colors.b, 2)) as \'color_proximity\'';
		}
		
		return '
		concat_ws(\',\', exp_photo_frame_colors.r, exp_photo_frame_colors.b, exp_photo_frame_colors.g) as \'color_rgb\',
		exp_photo_frame_colors.photo_id,
		exp_photo_frame_colors.r, 
		exp_photo_frame_colors.g, 
		exp_photo_frame_colors.b, 
		exp_photo_frame_colors.depth as \'color_depth\''.$color_sql;
	}
	
	public function get_join()
	{
		return 'LEFT JOIN (
			SELECT 
				exp_photo_frame.*, 
				exp_photo_frame_colors.photo_id, 
				exp_photo_frame_colors.depth, 
				exp_photo_frame_colors.r, 
				exp_photo_frame_colors.g, 
				exp_photo_frame_colors.b, 
				(POW(255 - r, 2) + POW(0 - g, 2) + POW(0 - b, 2)) as \'color_proximity\' 
			FROM 
				exp_photo_frame_colors 
			LEFT JOIN 
				exp_photo_frame USING (entry_id) 
			ORDER BY color_proximity ASC, depth ASC
		) as exp_photo_frame_colors  USING (entry_id)';
	}
	
	public function get_group_by()
	{
		return 'photo_id'; //return 'color_rgb';
	}
	
	public function get_having()
	{
		$settings = $this->get_settings();
		$rules    = $settings->rules;
		
		$color = strtolower($this->input($rules->form_field));
		$color = $this->_get_color($color, $rules);
		
		if($color)
		{
			if(empty($rules->min_proximity))
			{
				$rules->min_proximity = 0;
			}
			
			if(empty($rules->max_proximity))
			{
				$rules->max_proximity = 8000;
			}
			
			if(empty($rules->min_color_depth))
			{
				$rules->min_color_depth = 0;
			}
						
			if(empty($rules->max_color_depth))
			{
				$rules->max_color_depth = 3;
			}
			
			$having = array(
				'color_proximity >= '.$rules->min_proximity,
				'color_proximity <= '.$rules->max_proximity,
				'color_depth >= '.$rules->min_color_depth,
				'color_depth <= '.$rules->max_color_depth
			);
			
			return implode(' AND ', $having);
		}	
	}
	
	private function _get_color($color, $rules)
	{
		$color_index = config_item('photo_frame_color_index');
		
		$return = FALSE;
		
		if(isset($color_index[$color]))
		{
			$return = $color_index[$color];
		}
		
		if(isset($rules->color_index) && is_array($rules->color_index))
		{
			foreach($rules->color_index as $index => $color_index)
			{
				if($color_index->color_name == $color)
				{
					unset($color_index->color_name);
					
					$return = $color_index->r.','.$color_index->g.','.$color_index->b;
				}
			}
		}
		
		return $return;
	}
}