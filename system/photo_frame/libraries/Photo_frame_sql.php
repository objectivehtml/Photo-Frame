<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Photo_frame_sql {
	
	public function get_select($color)
	{		
		/*
		$color_sql = NULL;
		
		if($color)
		{
			if(is_string($color))
			{
				$color = explode(',', $color);
			}
			
			$r = isset($color['red']) ? $color['red'] : $color[0];
			$g = isset($color['blue']) ? $color['blue'] : $color[1];
			$b = isset($color['green']) ? $color['green'] :  $color[2];
			
			$color_sql = ', (POW('.$r.' - exp_photo_frame_colors.r, 2) + POW('.$g.' - exp_photo_frame_colors.g, 2) + POW('.$b.' - exp_photo_frame_colors.b, 2)) as \'color_proximity\'';
		}
		*/
		
		return trim('
		concat_ws(\',\', exp_photo_frame_colors.r, exp_photo_frame_colors.b, exp_photo_frame_colors.g) as \'color_rgb\',
		exp_photo_frame_colors.photo_id,
		exp_photo_frame_colors.r, 
		exp_photo_frame_colors.g, 
		exp_photo_frame_colors.b, 
		exp_photo_frame_colors.depth as \'color_depth\''.$color_sql).',
		exp_photo_frame_colors.color_proximity,
		exp_photo_frame_colors.photo_ids';
	}
	
	public function get_join($color, $having = FALSE)
	{
		$r = 0;
		$g = 0;
		$b = 0;
		
		if($color)
		{
			if(is_string($color))
			{
				$color = explode(',', $color);
			}
			
			$r = isset($color['red']) ? $color['red'] : $color[0];
			$g = isset($color['blue']) ? $color['blue'] : $color[1];
			$b = isset($color['green']) ? $color['green'] :  $color[2];
		}
		
		$having_sql = FALSE;
		
		if($having)
		{
			$having_sql = 'HAVING '.$having;
		}
		
		return trim('(
			SELECT 
				exp_photo_frame.*, 
				exp_photo_frame_colors.photo_id, 
				exp_photo_frame_colors.depth, 
				exp_photo_frame_colors.depth as \'color_depth\', 
				exp_photo_frame_colors.r, 
				exp_photo_frame_colors.g, 
				exp_photo_frame_colors.b, 
				(POW('.$r.' - r, 2) + POW('.$g.' - g, 2) + POW('.$b.' - b, 2)) as \'color_proximity\', 
				GROUP_CONCAT(DISTINCT exp_photo_frame.id) as \'photo_ids\'
			FROM 
				exp_photo_frame_colors
			JOIN 
				exp_photo_frame USING (entry_id)
			WHERE
				exp_photo_frame.entry_id != \'\'
			'.$having_sql.'
			ORDER BY color_proximity ASC, depth ASC
		) as exp_photo_frame_colors');
	}
	
	public function get_having($min_prox, $max_prox, $min_color, $max_color)
	{		
		if(empty($min_prox))
		{
			$min_prox = 0;
		}
		
		if(empty($max_prox))
		{
			$max_prox = 8000;
		}
		
		if(empty($min_color))
		{
			$min_color = 0;
		}
					
		if(empty($max_color))
		{
			$max_color = 3;
		}
		
		$having = array(
			'color_proximity >= '.$min_prox,
			'color_proximity <= '.$max_prox,
			'color_depth >= '.$min_color,
			'color_depth <= '.$max_color
		);
		
		return implode(' AND ', $having);
	}
}