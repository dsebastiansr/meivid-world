import trimesh, numpy as np, math, os
from trimesh.creation import icosphere, cylinder, cone, box
from trimesh.transformations import rotation_matrix

scene = trimesh.Scene()
def mat(name, color):
    return trimesh.visual.material.PBRMaterial(name=name, baseColorFactor=(*color,1), metallicFactor=0.0, roughnessFactor=0.85)
skin=mat("Warm peach skin",(0.92,0.66,0.49))
hair=mat("Chestnut brown hair",(0.43,0.22,0.12))
shirt=mat("Mint green shirt",(0.52,0.88,0.67))
shorts=mat("Olive shorts",(0.48,0.52,0.20))
shoe=mat("Brown shoes",(0.43,0.27,0.17))
eye=mat("Dark brown eyes",(0.22,0.13,0.08))
mouthmat=mat("Mouth",(0.16,0.08,0.05))
blush=mat("Rosy cheeks",(0.95,0.53,0.42))
nosemat=mat("Nose",(0.78,0.43,0.25))

def add(mesh, name, material):
    mesh.visual.material=material
    scene.add_geometry(mesh, node_name=name, geom_name=name)

def ico(name, pos, scale, material, subdivisions=2):
    m=icosphere(subdivisions=subdivisions, radius=1)
    m.apply_scale(scale); m.apply_translation(pos); add(m,name,material)

def tapered(name, p1, p2, r1, r2, material, sections=8):
    p1=np.array(p1,float); p2=np.array(p2,float); d=p2-p1
    length=np.linalg.norm(d)
    m=trimesh.creation.conical_frustum if hasattr(trimesh.creation,'conical_frustum') else None
    # create cylinder and scale radii using custom ring mesh
    axis=d/length
    # basis
    u=np.cross(axis,[0,1,0])
    if np.linalg.norm(u)<1e-6: u=np.cross(axis,[1,0,0])
    u=u/np.linalg.norm(u); v=np.cross(axis,u)
    verts=[]
    for center,r in [(p1,r1),(p2,r2)]:
        for i in range(sections):
            a=2*np.pi*i/sections
            verts.append(center+r*(np.cos(a)*u+np.sin(a)*v))
    faces=[]
    for i in range(sections):
        j=(i+1)%sections
        faces += [[i,j,sections+j],[i,sections+j,sections+i]]
    faces += [list(range(sections-1,-1,-1)),list(range(sections,2*sections))]
    mesh=trimesh.Trimesh(vertices=np.array(verts),faces=np.array(faces),process=True)
    add(mesh,name,material)

# shoes + legs
ico("Left shoe",(-0.22,-0.03,0.18),(0.19,0.25,0.11),shoe,1)
ico("Right shoe",(0.22,-0.03,0.18),(0.19,0.25,0.11),shoe,1)
tapered("Left leg",(-0.22,0,0.25),(-0.20,0,0.88),0.105,0.095,skin,7)
tapered("Right leg",(0.22,0,0.25),(0.20,0,0.88),0.105,0.095,skin,7)
# shorts
ico("Shorts body",(0,0,1.03),(0.48,0.30,0.34),shorts,2)
# split leg hems
ico("Shorts left leg",(-0.20,0,0.86),(0.23,0.29,0.20),shorts,1)
ico("Shorts right leg",(0.20,0,0.86),(0.23,0.29,0.20),shorts,1)
# torso shirt
tapered("T-shirt torso",(0,0,1.12),(0,0,2.05),0.40,0.47,shirt,8)
ico("Shirt hem",(0,0,1.18),(0.47,0.31,0.10),shirt,1)
# neck
tapered("Neck",(0,0,2.00),(0,0,2.20),0.13,0.14,skin,7)
# arms down angled
tapered("Left upper arm",(-0.38,0,1.88),(-0.63,0,1.45),0.14,0.11,shirt,7)
tapered("Left forearm",(-0.63,0,1.45),(-0.78,-0.01,1.18),0.105,0.095,skin,7)
ico("Left hand",(-0.80,-0.02,1.13),(0.16,0.15,0.16),skin,1)
tapered("Right upper arm",(0.38,0,1.88),(0.63,0,1.45),0.14,0.11,shirt,7)
tapered("Right forearm",(0.63,0,1.45),(0.78,-0.01,1.18),0.105,0.095,skin,7)
ico("Right hand",(0.80,-0.02,1.13),(0.16,0.15,0.16),skin,1)
# head
ico("Head",(0,-0.01,2.62),(0.78,0.62,0.72),skin,2)
# hair top dome, large sphere shifted up/back
ico("Hair cap",(0,0.02,2.98),(0.80,0.64,0.48),hair,2)
# hair fringe blocks on front (y negative)
ico("Hair fringe center",(-0.08,-0.53,2.80),(0.42,0.14,0.23),hair,1)
ico("Hair fringe left",(-0.42,-0.48,2.82),(0.27,0.14,0.20),hair,1)
ico("Hair fringe right",(0.34,-0.49,2.83),(0.27,0.14,0.19),hair,1)
# small side tuft
ico("Hair tuft",(0.62,0.02,3.30),(0.20,0.18,0.14),hair,1)
# ears
ico("Left ear",(-0.75,-0.03,2.55),(0.15,0.16,0.20),skin,1)
ico("Right ear",(0.75,-0.03,2.55),(0.15,0.16,0.20),skin,1)
# eyes
ico("Left eye",(-0.30,-0.615,2.63),(0.105,0.055,0.16),eye,1)
ico("Right eye",(0.30,-0.615,2.63),(0.105,0.055,0.16),eye,1)
# blush cheeks
ico("Left blush",(-0.48,-0.56,2.42),(0.16,0.035,0.09),blush,1)
ico("Right blush",(0.48,-0.56,2.42),(0.16,0.035,0.09),blush,1)
# nose triangular
nose=cone(radius=0.105,height=0.16,sections=3)
nose.apply_transform(rotation_matrix(math.pi/2,[1,0,0]))
nose.apply_translation((0,-0.67,2.48))
add(nose,"Small triangular nose",nosemat)
# mouth smile as small dark curved-ish line represented by flattened ellipsoid
ico("Smile",(0,-0.615,2.34),(0.18,0.035,0.045),mouthmat,1)
# create slight smile corners
ico("Smile left corner",(-0.14,-0.61,2.36),(0.045,0.035,0.035),mouthmat,1)
ico("Smile right corner",(0.14,-0.61,2.36),(0.045,0.035,0.035),mouthmat,1)

# export glb
out="/mnt/data/stylized_chibi_character.glb"
scene.export(out)
print(f"Created GLB: {out}")
print(f"Meshes: {len(scene.geometry)} | Approx. triangles: {sum(len(g.faces) for g in scene.geometry.values())}")

scene = trimesh.Scene()
def mat(name, color):
    return trimesh.visual.material.PBRMaterial(name=name, baseColorFactor=(*color,1), metallicFactor=0.0, roughnessFactor=0.85)
skin=mat("Warm peach skin",(0.92,0.66,0.49)); hair=mat("Chestnut brown hair",(0.43,0.22,0.12))
shirt=mat("Mint green shirt",(0.52,0.88,0.67)); shorts=mat("Olive shorts",(0.48,0.52,0.20))
shoe=mat("Brown shoes",(0.43,0.27,0.17)); eye=mat("Dark brown eyes",(0.22,0.13,0.08))
mouthmat=mat("Mouth",(0.16,0.08,0.05)); blush=mat("Rosy cheeks",(0.95,0.53,0.42)); nosemat=mat("Nose",(0.78,0.43,0.25))
def add(mesh,name,material):
    mesh.visual.material=material; scene.add_geometry(mesh,node_name=name,geom_name=name)
def ico(name,pos,scale,material,subdivisions=2):
    m=icosphere(subdivisions=subdivisions,radius=1); m.apply_scale(scale); m.apply_translation(pos); add(m,name,material)
def tapered(name,p1,p2,r1,r2,material,sections=8):
    p1=np.array(p1,float); p2=np.array(p2,float); axis=(p2-p1); length=np.linalg.norm(axis); axis/=length
    u=np.cross(axis,[0,1,0])
    if np.linalg.norm(u)<1e-6: u=np.cross(axis,[1,0,0])
    u/=np.linalg.norm(u); v=np.cross(axis,u); verts=[]
    for center,r in [(p1,r1),(p2,r2)]:
        for i in range(sections):
            a=2*np.pi*i/sections; verts.append(center+r*(np.cos(a)*u+np.sin(a)*v))
    faces=[]
    for i in range(sections):
        j=(i+1)%sections; faces.extend([[i,j,sections+j],[i,sections+j,sections+i]])
    for i in range(1,sections-1):
        faces.append([0,i+1,i]); faces.append([sections,sections+i,sections+i+1])
    mesh=trimesh.Trimesh(vertices=np.array(verts),faces=np.array(faces),process=True); add(mesh,name,material)

ico("Left shoe",(-.22,-.03,.18),(.19,.25,.11),shoe,1); ico("Right shoe",(.22,-.03,.18),(.19,.25,.11),shoe,1)
tapered("Left leg",(-.22,0,.25),(-.20,0,.88),.105,.095,skin,7); tapered("Right leg",(.22,0,.25),(.20,0,.88),.105,.095,skin,7)
ico("Shorts body",(0,0,1.03),(.48,.30,.34),shorts,2)
ico("Shorts left leg",(-.20,0,.86),(.23,.29,.20),shorts,1); ico("Shorts right leg",(.20,0,.86),(.23,.29,.20),shorts,1)
tapered("T-shirt torso",(0,0,1.12),(0,0,2.05),.40,.47,shirt,8); ico("Shirt hem",(0,0,1.18),(.47,.31,.10),shirt,1)
tapered("Neck",(0,0,2.00),(0,0,2.20),.13,.14,skin,7)
tapered("Left sleeve",(-.38,0,1.88),(-.63,0,1.45),.14,.11,shirt,7); tapered("Left arm",(-.63,0,1.45),(-.78,-.01,1.18),.105,.095,skin,7)
ico("Left hand",(-.80,-.02,1.13),(.16,.15,.16),skin,1)
tapered("Right sleeve",(.38,0,1.88),(.63,0,1.45),.14,.11,shirt,7); tapered("Right arm",(.63,0,1.45),(.78,-.01,1.18),.105,.095,skin,7)
ico("Right hand",(.80,-.02,1.13),(.16,.15,.16),skin,1)
ico("Head",(0,-.01,2.62),(.78,.62,.72),skin,2); ico("Hair cap",(0,.02,2.98),(.80,.64,.48),hair,2)
ico("Hair fringe center",(-.08,-.53,2.80),(.42,.14,.23),hair,1); ico("Hair fringe left",(-.42,-.48,2.82),(.27,.14,.20),hair,1); ico("Hair fringe right",(.34,-.49,2.83),(.27,.14,.19),hair,1)
ico("Hair tuft",(.62,.02,3.30),(.20,.18,.14),hair,1)
ico("Left ear",(-.75,-.03,2.55),(.15,.16,.20),skin,1); ico("Right ear",(.75,-.03,2.55),(.15,.16,.20),skin,1)
ico("Left eye",(-.30,-.615,2.63),(.105,.055,.16),eye,1); ico("Right eye",(.30,-.615,2.63),(.105,.055,.16),eye,1)
ico("Left blush",(-.48,-.56,2.42),(.16,.035,.09),blush,1); ico("Right blush",(.48,-.56,2.42),(.16,.035,.09),blush,1)
nose=cone(radius=.105,height=.16,sections=3); nose.apply_transform(rotation_matrix(math.pi/2,[1,0,0])); nose.apply_translation((0,-.67,2.48)); add(nose,"Small triangular nose",nosemat)
ico("Smile",(0,-.615,2.34),(.18,.035,.045),mouthmat,1); ico("Smile left corner",(-.14,-.61,2.36),(.045,.035,.035),mouthmat,1); ico("Smile right corner",(.14,-.61,2.36),(.045,.035,.035),mouthmat,1)
out="/mnt/data/stylized_chibi_character.glb"; scene.export(out)
print("GLB generado:",out,"| piezas:",len(scene.geometry),"| triángulos:",sum(len(g.faces) for g in scene.geometry.values()))