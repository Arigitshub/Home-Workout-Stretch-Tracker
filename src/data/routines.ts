import { Exercise, Routine } from '../types';

export const exerciseCatalog: Exercise[] = [
  {
    id: 'jumping_jacks',
    name: 'Jumping Jacks',
    duration: 30,
    description: 'A classic cardio movement that warms up the entire body.',
    instructions: [
      'Stand with your feet together and arms at your sides.',
      'Jump your feet out to the sides while raising your arms above your head.',
      'Immediately jump back to the starting position.',
      'Maintain a steady, rhythmic pace.'
    ],
    type: 'workout'
  },
  {
    id: 'squats',
    name: 'Air Squats',
    duration: 40,
    description: 'Excellent lower-body exercise targeting the quads, hamstrings, and glutes.',
    instructions: [
      'Stand with feet shoulder-width apart, toes pointing slightly outward.',
      'Keep your chest up and core engaged.',
      'Lower your hips back and down as if sitting in a chair.',
      'Lower until thighs are parallel to the ground (or as low as comfortable).',
      'Push through your heels to return to standing.'
    ],
    type: 'workout'
  },
  {
    id: 'pushups',
    name: 'Push-Ups',
    duration: 30,
    description: 'Fundamental upper-body exercise for the chest, shoulders, and triceps.',
    instructions: [
      'Start in a plank position with hands slightly wider than shoulder-width.',
      'Keep your body in a straight line from head to heels.',
      'Lower your chest toward the floor by bending your elbows.',
      'Push back up to the starting position without arching your back.'
    ],
    type: 'workout'
  },
  {
    id: 'plank',
    name: 'Forearm Plank',
    duration: 45,
    description: 'Core stabilization exercise that builds strength in the abdominal wall and back.',
    instructions: [
      'Place your forearms on the floor, elbows aligned under shoulders.',
      'Extend legs straight behind you, feet hip-width apart.',
      'Engage your core, glutes, and thighs to keep your body level.',
      'Do not let your hips sag or rise; look down at the floor.'
    ],
    type: 'workout'
  },
  {
    id: 'mountain_climbers',
    name: 'Mountain Climbers',
    duration: 30,
    description: 'Dynamic plank variation that boosts heart rate and challenges the core.',
    instructions: [
      'Begin in a high plank position with hands under shoulders.',
      'Drive your right knee toward your chest.',
      'Quickly switch, extending the right leg while driving the left knee forward.',
      'Keep your hips down and run in place as fast as you can with good form.'
    ],
    type: 'workout'
  },
  {
    id: 'lunges',
    name: 'Alternating Lunges',
    duration: 40,
    description: 'Unilateral leg strength exercise targeting balance and thigh muscles.',
    instructions: [
      'Stand tall with your feet hip-width apart.',
      'Step forward with your right foot and lower your hips.',
      'Stop when both knees are bent at 90-degree angles.',
      'Push off your right heel to return to standing.',
      'Repeat by stepping forward with the left foot.'
    ],
    type: 'workout'
  },
  {
    id: 'bicycle_crunches',
    name: 'Bicycle Crunches',
    duration: 40,
    description: 'Active core workout targeting the obliques and rectus abdominis.',
    instructions: [
      'Lie flat on your back with knees bent and hands behind your head.',
      'Lift your shoulders off the floor and bring knees up to 90 degrees.',
      'Twist your torso to bring your right elbow toward your left knee, extending the right leg straight out.',
      'Switch sides: left elbow to right knee, extending the left leg.',
      'Continue alternating in a smooth, cycling motion.'
    ],
    type: 'workout'
  },
  {
    id: 'russian_twists',
    name: 'Russian Twists',
    duration: 30,
    description: 'Rotational core movement for obliques and deep spinal stabilizers.',
    instructions: [
      'Sit on the floor with knees bent and feet flat (or slightly raised for difficulty).',
      'Lean back slightly, keeping your spine straight and core braced.',
      'Hold your hands together in front of your chest.',
      'Slowly rotate your torso from side to side, tapping the floor beside you.'
    ],
    type: 'workout'
  },
  {
    id: 'glute_bridges',
    name: 'Glute Bridges',
    duration: 45,
    description: 'Lying exercise targeting posterior chain activation (glutes, back, hamstrings).',
    instructions: [
      'Lie on your back with knees bent and feet flat on the floor, hip-width apart.',
      'Keep arms flat at your sides.',
      'Squeeze your glutes and press through heels to lift hips toward the ceiling.',
      'Create a straight line from shoulders to knees, hold for 1 second, then lower.'
    ],
    type: 'workout'
  },
  {
    id: 'cat_cow',
    name: 'Cat-Cow Pose',
    duration: 45,
    description: 'Gentle spinal flow that coordinates movement with breathing.',
    instructions: [
      'Start on your hands and knees in a tabletop position.',
      'Inhale (Cow): Arch your back, drop your belly, and look up towards the ceiling.',
      'Exhale (Cat): Round your spine, tuck your chin, and pull your belly button up.'
    ],
    type: 'stretch'
  },
  {
    id: 'downward_dog',
    name: 'Downward-Facing Dog',
    duration: 45,
    description: 'Classic yoga inversion that stretches the back, hamstrings, and calves.',
    instructions: [
      'Start in tabletop, tuck your toes, and lift your knees off the floor.',
      'Press your hips back and upward, extending your arms and spine.',
      'Try to press your heels toward the ground, making an inverted V-shape.',
      'Keep shoulders broad and release any neck tension.'
    ],
    type: 'stretch'
  },
  {
    id: 'cobra_pose',
    name: 'Cobra Pose',
    duration: 30,
    description: 'Gentle backbend that opens the chest, shoulders, and stretches the abdominals.',
    instructions: [
      'Lie face down on the floor with hands placed under your shoulders.',
      'Hug your elbows closely into your chest.',
      'Press the tops of your feet and thighs firmly into the ground.',
      'Inhale and lift your chest off the floor, keeping your elbows bent and shoulders relaxed.'
    ],
    type: 'stretch'
  },
  {
    id: 'childs_pose',
    name: "Child's Pose",
    duration: 60,
    description: 'Restorative resting posture that gently stretches the hips, lower back, and shoulders.',
    instructions: [
      'Kneel on the floor, touch your big toes together, and sit on your heels.',
      'Separate your knees about hip-width apart.',
      'Exhale and fold forward, resting your torso between your thighs.',
      'Extend your arms forward on the floor, palms down, and rest your forehead.'
    ],
    type: 'stretch'
  },
  {
    id: 'warrior_i',
    name: 'Warrior I Pose',
    duration: 45,
    description: 'Standing posture that stretches the hips, chest, and strengthens the legs.',
    instructions: [
      'Step your right foot forward into a lunge, left foot turned out 45 degrees.',
      'Bend your right knee to 90 degrees, keeping it aligned over your ankle.',
      'Square your hips forward and sweep your arms overhead, palms facing.',
      'Look up slightly toward your hands and breathe deeply.'
    ],
    type: 'stretch'
  },
  {
    id: 'warrior_ii',
    name: 'Warrior II Pose',
    duration: 45,
    description: 'Powerful standing pose that opens hips and chest, stretching the groin.',
    instructions: [
      'From lunge, open your torso to the side, extending arms to a T-shape.',
      'Right arm pointing forward, left arm pointing back, parallel to floor.',
      'Keep front knee bent 90 degrees; look over your right middle finger.',
      'Keep shoulders stacked directly over your hips.'
    ],
    type: 'stretch'
  },
  {
    id: 'seated_twist',
    name: 'Seated Spinal Twist',
    duration: 45,
    description: 'Twisting stretch that increases mobility in the spine and opens the shoulders.',
    instructions: [
      'Sit on the floor with both legs extended straight out.',
      'Bend your right knee and place your right foot on the outside of your left knee.',
      'Place your right hand on the floor behind you for support.',
      'Hug your right knee with your left arm or place left elbow outside right knee.',
      'Gently twist to the right, looking over your right shoulder.'
    ],
    type: 'stretch'
  },
  {
    id: 'quad_stretch',
    name: 'Standing Quad Stretch',
    duration: 40,
    description: 'Stretches the front leg muscles (quadriceps) and hip flexors.',
    instructions: [
      'Stand upright (hold onto a wall or chair for balance if needed).',
      'Bend your right knee, bringing your heel toward your buttocks.',
      'Reach back and grab your ankle or foot with your right hand.',
      'Keep your knees close together and push your hips forward slightly.',
      'Hold, then switch sides.'
    ],
    type: 'stretch'
  },
  {
    id: 'chest_opener',
    name: 'Interlaced Chest Opener',
    duration: 30,
    description: 'Stretches the front shoulders, pectorals, and counteracts desk posture.',
    instructions: [
      'Stand straight with feet hip-width apart.',
      'Interlace your fingers behind your lower back.',
      'Straighten your arms and lift your chest up and out.',
      'Gently pull your shoulders back and lift your hands away from your back.'
    ],
    type: 'stretch'
  },
  {
    id: 'neck_rolls',
    name: 'Slow Neck Rolls',
    duration: 30,
    description: 'Relieves accumulated stress and tension in the neck and upper shoulders.',
    instructions: [
      'Sit or stand comfortably with shoulders relaxed.',
      'Gently drop your chin to your chest.',
      'Slowly roll your right ear toward your right shoulder.',
      'Roll your head back, then left ear to left shoulder, returning to chest.',
      'Perform slow, controlled circles, swapping directions halfway.'
    ],
    type: 'stretch'
  },
  {
    id: 'wrist_stretch',
    name: 'Wrist & Forearm Flex',
    duration: 30,
    description: 'Essential stretch for wrists, forearms, and fingers, ideal for computer users.',
    instructions: [
      'Extend your right arm straight in front of you, palm facing out, fingers pointing down.',
      'Use your left hand to gently pull your right fingers back toward your body.',
      'Hold for 15 seconds, then flip your hand (palm facing in) and pull down.',
      'Repeat on the left arm.'
    ],
    type: 'stretch'
  },
  {
    id: 'savasana',
    name: 'Savasana (Corpse Pose)',
    duration: 90,
    description: 'The ultimate relaxation stretch that restores nervous system equilibrium.',
    instructions: [
      'Lie flat on your back with legs spread slightly and arms out at your sides.',
      'Turn your palms up, close your eyes, and relax all facial muscles.',
      'Release all muscular effort and let your breath become natural.',
      'Focus on a feeling of heavy relaxation throughout your body.'
    ],
    type: 'stretch'
  },
  {
    id: 'db_bicep_curls',
    name: 'Dumbbell Bicep Curls',
    duration: 40,
    description: 'Classic bicep exercise to build arm strength and definition.',
    instructions: [
      'Hold dumbbells by your sides, palms facing forward.',
      'Keep elbows close to your torso.',
      'Curl the weights up while contracting your biceps.',
      'Lower the dumbbells back down slowly to complete one rep.'
    ],
    type: 'workout',
    needsWeight: true,
    weightLbs: 10
  },
  {
    id: 'db_shoulder_press',
    name: 'Dumbbell Shoulder Press',
    duration: 45,
    description: 'Strengthens the shoulders, upper back, and triceps.',
    instructions: [
      'Sit or stand tall, holding dumbbells at shoulder level.',
      'Palms should face forward, elbows bent at 90 degrees.',
      'Press weights straight up until your arms are fully extended.',
      'Slowly lower back to starting shoulder height.'
    ],
    type: 'workout',
    needsWeight: true,
    weightLbs: 10
  },
  {
    id: 'db_squats',
    name: 'Dumbbell Squats',
    duration: 45,
    description: 'Squat exercise performed with dumbbells held at your sides to build lower body strength.',
    instructions: [
      'Stand with feet shoulder-width apart, holding dumbbells at your sides.',
      'Keep your chest high, shoulder blades back, and core engaged.',
      'Lower your hips back and bend knees to drop into a squat.',
      'Drive through your heels to return to standing, squeezing your glutes at the top.'
    ],
    type: 'workout',
    needsWeight: true,
    weightLbs: 10
  },
  {
    id: 'db_goblet_squats',
    name: 'Dumbbell Goblet Squats',
    duration: 45,
    description: 'Loaded lower-body squat to increase quad, glute, and core activation.',
    instructions: [
      'Hold a single dumbbell vertically by its head near your chest.',
      'Set feet shoulder-width apart, toes pointing slightly out.',
      'Lower your hips back and down while keeping your chest upright.',
      'Push through your heels to return to standing.'
    ],
    type: 'workout',
    needsWeight: true,
    weightLbs: 10
  },
  {
    id: 'db_rows',
    name: 'Bent-Over Dumbbell Rows',
    duration: 45,
    description: 'Excellent back exercise targeting latissimus dorsi and rhomboids.',
    instructions: [
      'Hold a dumbbell in each hand, bend knees slightly, lean forward from hips.',
      'Keep back flat, letting dumbbells hang straight down.',
      'Pull dumbbells to your waist, squeezing your shoulder blades.',
      'Slowly lower dumbbells back to the starting position.'
    ],
    type: 'workout',
    needsWeight: true,
    weightLbs: 10
  },
  {
    id: 'db_chest_press',
    name: 'Dumbbell Floor Press',
    duration: 40,
    description: 'Triceps and chest press performed on the floor for safety and shoulder stability.',
    instructions: [
      'Lie on your back, knees bent, feet flat on the floor.',
      'Hold dumbbells at chest level, elbows resting on the floor at 45 degrees.',
      'Press dumbbells straight up above your chest.',
      'Lower slowly until your elbows gently touch the floor again.'
    ],
    type: 'workout',
    needsWeight: true,
    weightLbs: 10
  },
  {
    id: 'db_lunges',
    name: 'Dumbbell Walking Lunges',
    duration: 40,
    description: 'A great unilateral lower-body movement targeting quads, hamstrings, and stability.',
    instructions: [
      'Hold dumbbells at your sides, stand tall with feet hip-width apart.',
      'Step forward with your right leg, lowering your hips until both knees are bent at 90 degrees.',
      'Push off with your right foot and step forward with the left foot to lunge.',
      'Maintain an upright torso and keep your knees aligned.'
    ],
    type: 'workout',
    needsWeight: true,
    weightLbs: 10
  },
  {
    id: 'db_deadlifts',
    name: 'Dumbbell Romanian Deadlifts',
    duration: 45,
    description: 'Targets the posterior chain, including the hamstrings, glutes, and lower back.',
    instructions: [
      'Stand with feet hip-width apart, holding dumbbells in front of your thighs.',
      'Hinge at your hips, sending them backward while keeping your back completely flat.',
      'Lower the weights along your shins until you feel a stretch in your hamstrings.',
      'Drive your hips forward, squeezing your glutes to return to standing.'
    ],
    type: 'workout',
    needsWeight: true,
    weightLbs: 10
  },
  {
    id: 'db_lateral_raises',
    name: 'Dumbbell Lateral Raises',
    duration: 35,
    description: 'Isolation exercise targeting the lateral deltoids to build shoulder width.',
    instructions: [
      'Stand tall holding dumbbells at your sides, palms facing inward.',
      'Keep a slight bend in your elbows and raise your arms out to the sides.',
      'Lift until your arms are parallel to the floor (shoulder height).',
      'Lower the weights slowly back to the starting position.'
    ],
    type: 'workout',
    needsWeight: true,
    weightLbs: 10
  },
  {
    id: 'db_triceps_kickbacks',
    name: 'Dumbbell Triceps Kickbacks',
    duration: 40,
    description: 'Isolation exercise focusing on the back of the arms (triceps).',
    instructions: [
      'Hold a dumbbell in each hand, bend at the hips, keeping your back flat.',
      'Pull your elbows up high so your upper arms are parallel to your torso.',
      'Keeping your elbows locked in place, extend your arms straight back.',
      'Squeeze the triceps at the peak, then slowly return to 90 degrees.'
    ],
    type: 'workout',
    needsWeight: true,
    weightLbs: 10
  },
  {
    id: 'db_hammer_curls',
    name: 'Dumbbell Hammer Curls',
    duration: 40,
    description: 'Bicep exercise targeting the brachialis and forearm muscles for arm thickness.',
    instructions: [
      'Stand tall holding dumbbells at your sides, palms facing each other (neutral grip).',
      'Keep your elbows pinned to your sides and curl the weights up.',
      'Squeeze your biceps at the top, then slowly lower to full extension.'
    ],
    type: 'workout',
    needsWeight: true,
    weightLbs: 10
  },
  {
    id: 'db_chest_flyes',
    name: 'Dumbbell Floor Chest Flyes',
    duration: 40,
    description: 'Isolation exercise performed on the floor to stretch and strengthen chest fibers.',
    instructions: [
      'Lie flat on your back on the floor, knees bent and feet flat.',
      'Hold dumbbells directly above your chest, palms facing each other.',
      'With a slight bend in your elbows, open your arms wide to the sides.',
      'Lower until your upper arms touch the floor, then squeeze chest to bring weights back together.'
    ],
    type: 'workout',
    needsWeight: true,
    weightLbs: 10
  },
  {
    id: 'db_calf_raises',
    name: 'Dumbbell Standing Calf Raises',
    duration: 45,
    description: 'Strengthens and builds endurance in the gastrocnemius and soleus calf muscles.',
    instructions: [
      'Stand tall holding dumbbells at your sides.',
      'Set feet hip-width apart and lift up onto the balls of your feet.',
      'Squeeze your calves at the peak of the lift for 1 second.',
      'Lower slowly back to the ground.'
    ],
    type: 'workout',
    needsWeight: true,
    weightLbs: 10
  },
  {
    id: 'db_renegade_rows',
    name: 'Dumbbell Renegade Rows',
    duration: 45,
    description: 'Advanced compound core and back exercise performed in a push-up position.',
    instructions: [
      'Start in a push-up position with hands holding the dumbbell handles on the floor.',
      'Keep your feet set wide to maintain hip stability.',
      'Row one dumbbell up to your ribs, pulling with your back and stabilizing with your core.',
      'Lower it with control and repeat the row on the opposite side.'
    ],
    type: 'workout',
    needsWeight: true,
    weightLbs: 10
  }
];

export const predefinedRoutines: Routine[] = [
  {
    id: 'morning_yoga',
    title: 'Morning Yoga Flow',
    description: 'Gently awaken your spine, stretch tight joints, and set a mindful tone for your day.',
    duration: '6 min',
    difficulty: 'Beginner',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    exercises: [
      { ...exerciseCatalog.find(e => e.id === 'cat_cow')!, duration: 45 },
      { ...exerciseCatalog.find(e => e.id === 'downward_dog')!, duration: 45 },
      { ...exerciseCatalog.find(e => e.id === 'cobra_pose')!, duration: 30 },
      { ...exerciseCatalog.find(e => e.id === 'childs_pose')!, duration: 60 },
      { ...exerciseCatalog.find(e => e.id === 'warrior_i')!, duration: 45 },
      { ...exerciseCatalog.find(e => e.id === 'savasana')!, duration: 90 }
    ]
  },
  {
    id: 'full_body_hiit',
    title: 'Full Body HIIT',
    description: 'High-intensity intervals to raise your heart rate, burn calories, and build endurance.',
    duration: '4 min',
    difficulty: 'Intermediate',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    exercises: [
      { ...exerciseCatalog.find(e => e.id === 'jumping_jacks')!, duration: 30 },
      { ...exerciseCatalog.find(e => e.id === 'squats')!, duration: 45 },
      { ...exerciseCatalog.find(e => e.id === 'pushups')!, duration: 30 },
      { ...exerciseCatalog.find(e => e.id === 'mountain_climbers')!, duration: 30 },
      { ...exerciseCatalog.find(e => e.id === 'lunges')!, duration: 45 },
      { ...exerciseCatalog.find(e => e.id === 'plank')!, duration: 45 }
    ]
  },
  {
    id: 'core_strength',
    title: 'Core Strengthening',
    description: 'Challenging core routine focused on stabilizing abdominal and back muscles.',
    duration: '3.5 min',
    difficulty: 'Advanced',
    image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    exercises: [
      { ...exerciseCatalog.find(e => e.id === 'plank')!, duration: 60 },
      { ...exerciseCatalog.find(e => e.id === 'bicycle_crunches')!, duration: 45 },
      { ...exerciseCatalog.find(e => e.id === 'russian_twists')!, duration: 30 },
      { ...exerciseCatalog.find(e => e.id === 'glute_bridges')!, duration: 45 },
      { ...exerciseCatalog.find(e => e.id === 'plank')!, duration: 30 }
    ]
  },
  {
    id: 'desk_stretch',
    title: 'Desk Re-Energizer',
    description: 'Relieve posture strain, open stiff chest muscles, and refresh your mind at your desk.',
    duration: '2.5 min',
    difficulty: 'Beginner',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    exercises: [
      { ...exerciseCatalog.find(e => e.id === 'neck_rolls')!, duration: 30 },
      { ...exerciseCatalog.find(e => e.id === 'chest_opener')!, duration: 30 },
      { ...exerciseCatalog.find(e => e.id === 'seated_twist')!, duration: 45 },
      { ...exerciseCatalog.find(e => e.id === 'wrist_stretch')!, duration: 30 }
    ]
  },
  {
    id: 'post_workout_stretch',
    title: 'Post-Workout Stretch',
    description: 'Cool down, relax tight muscles, and promote speedier recovery after training.',
    duration: '3.5 min',
    difficulty: 'Beginner',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    exercises: [
      { ...exerciseCatalog.find(e => e.id === 'quad_stretch')!, duration: 40 },
      { ...exerciseCatalog.find(e => e.id === 'downward_dog')!, duration: 45 },
      { ...exerciseCatalog.find(e => e.id === 'cobra_pose')!, duration: 30 },
      { ...exerciseCatalog.find(e => e.id === 'childs_pose')!, duration: 60 }
    ]
  },
  {
    id: 'flexibility_yoga',
    title: 'Flexibility Booster',
    description: 'Deep stretching session designed to safely extend range of motion in hamstrings, back, and hips.',
    duration: '4.5 min',
    difficulty: 'Intermediate',
    image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    exercises: [
      { ...exerciseCatalog.find(e => e.id === 'cat_cow')!, duration: 45 },
      { ...exerciseCatalog.find(e => e.id === 'downward_dog')!, duration: 45 },
      { ...exerciseCatalog.find(e => e.id === 'warrior_i')!, duration: 45 },
      { ...exerciseCatalog.find(e => e.id === 'warrior_ii')!, duration: 45 },
      { ...exerciseCatalog.find(e => e.id === 'seated_twist')!, duration: 45 },
      { ...exerciseCatalog.find(e => e.id === 'childs_pose')!, duration: 60 }
    ]
  },
  {
    id: 'dumbbell_strength',
    title: 'Dumbbell Power & Tone',
    description: 'Full-body strength training routine using dumbbells. Targets major muscle groups (legs, chest, back, shoulders, arms).',
    duration: '3.5 min',
    difficulty: 'Intermediate',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    exercises: [
      { ...exerciseCatalog.find(e => e.id === 'db_goblet_squats')!, duration: 45, weightLbs: 10 },
      { ...exerciseCatalog.find(e => e.id === 'db_shoulder_press')!, duration: 40, weightLbs: 10 },
      { ...exerciseCatalog.find(e => e.id === 'db_rows')!, duration: 45, weightLbs: 10 },
      { ...exerciseCatalog.find(e => e.id === 'db_bicep_curls')!, duration: 40, weightLbs: 10 },
      { ...exerciseCatalog.find(e => e.id === 'db_chest_press')!, duration: 40, weightLbs: 10 }
    ]
  },
  {
    id: 'db_lower_body',
    title: 'Dumbbell Leg Blast',
    description: 'Develop lower body power, leg definition, and glute activation with these targeted dumbbell movements.',
    duration: '3 min',
    difficulty: 'Intermediate',
    image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    exercises: [
      { ...exerciseCatalog.find(e => e.id === 'db_squats')!, duration: 45, weightLbs: 10 },
      { ...exerciseCatalog.find(e => e.id === 'db_lunges')!, duration: 40, weightLbs: 10 },
      { ...exerciseCatalog.find(e => e.id === 'db_deadlifts')!, duration: 45, weightLbs: 10 },
      { ...exerciseCatalog.find(e => e.id === 'db_calf_raises')!, duration: 45, weightLbs: 10 }
    ]
  },
  {
    id: 'db_upper_body',
    title: 'Dumbbell Upper Sculpt',
    description: 'A comprehensive upper-body routine using dumbbells to tone your arms, chest, shoulders, and back.',
    duration: '4 min',
    difficulty: 'Advanced',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    exercises: [
      { ...exerciseCatalog.find(e => e.id === 'db_chest_press')!, duration: 40, weightLbs: 10 },
      { ...exerciseCatalog.find(e => e.id === 'db_rows')!, duration: 45, weightLbs: 10 },
      { ...exerciseCatalog.find(e => e.id === 'db_shoulder_press')!, duration: 40, weightLbs: 10 },
      { ...exerciseCatalog.find(e => e.id === 'db_lateral_raises')!, duration: 35, weightLbs: 10 },
      { ...exerciseCatalog.find(e => e.id === 'db_hammer_curls')!, duration: 40, weightLbs: 10 },
      { ...exerciseCatalog.find(e => e.id === 'db_triceps_kickbacks')!, duration: 40, weightLbs: 10 }
    ]
  },
  {
    id: 'db_hiit_strength',
    title: 'Dumbbell Core & Strength HIIT',
    description: 'High-intensity compound movements to challenge your muscular endurance and core stability.',
    duration: '3 min',
    difficulty: 'Advanced',
    image: 'https://images.unsplash.com/photo-1605296867304-46d5465a25f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    exercises: [
      { ...exerciseCatalog.find(e => e.id === 'db_renegade_rows')!, duration: 45, weightLbs: 10 },
      { ...exerciseCatalog.find(e => e.id === 'db_goblet_squats')!, duration: 45, weightLbs: 10 },
      { ...exerciseCatalog.find(e => e.id === 'db_chest_flyes')!, duration: 40, weightLbs: 10 },
      { ...exerciseCatalog.find(e => e.id === 'db_hammer_curls')!, duration: 40, weightLbs: 10 }
    ]
  }
];

