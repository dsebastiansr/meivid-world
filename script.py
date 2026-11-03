import numpy as np, trimesh, math, os
from trimesh.creation import icosphere, cone
from trimesh.transformations import rotation_matrix

# Build a front-focused, stylized character with custom polygonal surfaces.
scene = trimesh.Scene()

def material(name, rgb, rough=0.9):
    return trimesh.visual.material.PBRMaterial(
        name=name, baseColorFactor=(*rgb, 1.0),
        metallicFactor=0.0, roughnessFactor=rough
    )

SKIN = material("Skin - warm peach", (0.91, 0.65, 0.49))
SKIN_LIGHT = material("Skin highlights", (0.96, 0.73, 0.57))
HAIR = material("Hair - chestnut", (0.40, 0.20, 0.115))
HAIR_LIGHT = material("Hair facets", (0.48, 0.25, 0.15))
SHIRT = material("T-shirt - mint", (0.54, 0.88, 0.67))
SHIRT_LIGHT = material("Fabric highlights", (0.64, 0.94, 0.75))
SHORTS = material("Shorts - olive", (0.43, 0.47, 0.19))
SHOE = material("Shoes - brown", (0.42, 0.25, 0.16))
EYE = material("Eyes", (0.22, 0.13, 0.085))
MOUTH = material("Smile", (0.12, 0.075, 0.055))
BLUSH = material("Cheeks", (0.94, 0.57, 0.44))
NOSE = material("Nose", (0.78, 0.42, 0.24))

def add(mesh, name, mat):
    mesh.visual.material = mat
    scene.add_geometry(mesh, node_name=name, geom_name=name)

def ellipsoid(name, center, scale, mat, sub=2):
    m = icosphere(subdivisions=sub, radius=1)
    m.apply_scale(scale)
    m.apply_translation(center)
    add(m, name, mat)
    return m

def ring_body(name, rings, mat, sides=12, phase=0):
    # Each ring: z, radius_x, radius_y, center_y
    verts=[]
    for z, rx, ry, cy in rings:
        for i in range(sides):
            a=2*np.pi*i/sides + phase
            verts.append([rx*np.cos(a), cy+ry*np.sin(a), z])
    faces=[]
    for r in range(len(rings)-1):
        for i in range(sides):
            j=(i+1)%sides
            a=r*sides+i; b=r*sides+j
            c=(r+1)*sides+j; d=(r+1)*sides+i
            faces.extend([[a,b,c],[a,c,d]])
    faces.append(list(range(sides-1,-1,-1)))
    faces.append(list(range((len(rings)-1)*sides,len(rings)*sides)))
    # triangulate caps to avoid non-triangle faces
    tri=[]
    for f in faces[:-2]:
        tri.append(f)
    for i in range(1,sides-1):
        tri.append([0,i+1,i])
        base=(len(rings)-1)*sides
        tri.append([base,base+i,base+i+1])
    mesh=trimesh.Trimesh(vertices=np.array(verts), faces=np.array(tri), process=True)
    add(mesh,name,mat)

def tapered_limb(name, p1, p2, r1, r2, mat, sides=9):
    p1=np.array(p1,float); p2=np.array(p2,float)
    axis=p2-p1; axis/=np.linalg.norm(axis)
    u=np.cross(axis,[0,1,0])
    if np.linalg.norm(u)<1e-6: u=np.cross(axis,[1,0,0])
    u/=np.linalg.norm(u); v=np.cross(axis,u)
    verts=[]
    for p,r in ((p1,r1),(p2,r2)):
        for i in range(sides):
            a=2*np.pi*i/sides
            verts.append(p+r*(np.cos(a)*u+np.sin(a)*v))
    faces=[]
    for i in range(sides):
        j=(i+1)%sides
        faces.extend([[i,j,sides+j],[i,sides+j,sides+i]])
    for i in range(1,sides-1):
        faces.extend([[0,i+1,i],[sides,sides+i,sides+i+1]])
    add(trimesh.Trimesh(vertices=verts,faces=faces,process=True),name,mat)

# Legs and shoes
ellipsoid("Left shoe",(-.205,-.045,.13),(.19,.28,.115),SHOE,1)
ellipsoid("Right shoe",(.205,-.045,.13),(.19,.28,.115),SHOE,1)
ellipsoid("Left shoe sole",(-.205,-.045,.075),(.18,.25,.035),HAIR,1)
ellipsoid("Right shoe sole",(.205,-.045,.075),(.18,.25,.035),HAIR,1)
tapered_limb("Left lower leg",(-.205,0,.19),(-.205,0,.83),.095,.105,SKIN,8)
tapered_limb("Right lower leg",(.205,0,.19),(.205,0,.83),.095,.105,SKIN,8)

# Shorts: broad waist, two distinct short legs
ring_body("Shorts waistband",[(.79,.37,.235,0),(.98,.39,.245,0)],SHORTS,12)
ellipsoid("Left shorts leg",(-.18,0,.78),(.205,.25,.22),SHORTS,1)
ellipsoid("Right shorts leg",(.18,0,.78),(.205,.25,.22),SHORTS,1)

# Neck, torso and shirt silhouette
tapered_limb("Neck",(0,0,1.55),(0,0,1.82),.13,.14,SKIN,9)
ring_body("Mint T-shirt",[
    (1.00,.40,.245,0),(1.08,.47,.285,0),(1.42,.43,.27,0),
    (1.70,.34,.235,0),(1.83,.27,.20,0)
],SHIRT,12,math.pi/12)
# collar
ellipsoid("Neckline",(0,-.005,1.79),(.17,.205,.055),SHIRT_LIGHT,1)

# Sleeves and arms, angled down/out like reference
tapered_limb("Left sleeve",(-.31,0,1.68),(-.57,-.005,1.36),.155,.145,SHIRT,8)
tapered_limb("Right sleeve",(.31,0,1.68),(.57,-.005,1.36),.155,.145,SHIRT,8)
tapered_limb("Left forearm",(-.57,0,1.37),(-.78,-.015,1.08),.105,.105,SKIN,8)
tapered_limb("Right forearm",(.57,0,1.37),(.78,-.015,1.08),.105,.105,SKIN,8)
ellipsoid("Left hand",(-.80,-.025,1.04),(.155,.145,.16),SKIN,1)
ellipsoid("Right hand",(.80,-.025,1.04),(.155,.145,.16),SKIN,1)

# Oversized head: broad, slightly tapered lower jaw
ring_body("Head",[
    (1.88,.35,.34,-.005),(1.98,.57,.47,-.005),
    (2.18,.72,.56,-.005),(2.48,.79,.61,-.005),
    (2.83,.78,.60,-.005),(3.12,.69,.54,-.005),
    (3.34,.48,.40,-.005),(3.40,.12,.12,-.005)
],SKIN,16,math.pi/16)
# ears sit at widest point
ellipsoid("Left ear",(-.79,-.015,2.48),(.16,.16,.205),SKIN,1)
ellipsoid("Right ear",(.79,-.015,2.48),(.16,.16,.205),SKIN,1)

# Hair cap: upper dome and thick side locks
ellipsoid("Hair crown",(0,.015,3.17),(.79,.61,.43),HAIR,2)
ellipsoid("Left side hair",(-.70,-.005,2.77),(.18,.56,.48),HAIR,1)
ellipsoid("Right side hair",(.70,-.005,2.77),(.18,.56,.48),HAIR,1)
# Angular fringe pieces overlap forehead; front is -Y
ellipsoid("Fringe left",(-.49,-.49,2.99),(.30,.19,.25),HAIR,1)
ellipsoid("Fringe middle left",(-.20,-.565,2.93),(.34,.16,.29),HAIR_LIGHT,1)
ellipsoid("Fringe center",( .16,-.55,2.98),(.38,.17,.27),HAIR,1)
ellipsoid("Fringe right",(.51,-.47,3.02),(.25,.17,.24),HAIR_LIGHT,1)
# small signature hair tuft on upper right
ellipsoid("Side hair tuft",(.76,.005,3.48),(.19,.19,.13),HAIR_LIGHT,1)

# Face: eyes placed forward and slightly inset
ellipsoid("Left eye",(-.285,-.566,2.57),(.085,.052,.145),EYE,2)
ellipsoid("Right eye",(.285,-.566,2.57),(.085,.052,.145),EYE,2)
# subtle cheek patches
ellipsoid("Left cheek",(-.49,-.515,2.34),(.145,.035,.085),BLUSH,2)
ellipsoid("Right cheek",(.49,-.515,2.34),(.145,.035,.085),BLUSH,2)

# Tiny triangular nose, oriented to project toward front (-Y)
nose=cone(radius=.095,height=.14,sections=3)
nose.apply_transform(rotation_matrix(math.pi/2,[1,0,0]))
nose.apply_translation((0,-.625,2.43))
add(nose,"Small triangular nose",NOSE)

# Smile as a shallow curved tube made from connected low-poly segments
pts=[]
for t in np.linspace(-1,1,9):
    pts.append([.15*t,-.594,2.29 + .045*(t*t)])
for i in range(len(pts)-1):
    tapered_limb(f"Smile segment {i}",pts[i],pts[i+1],.018,.018,MOUTH,5)

# Export in current working directory
out_path=os.path.join(os.getcwd(),"chibi_reference_front.glb")
scene.export(out_path)
print("Modelo exportado:", out_path)
print("Piezas:",len(scene.geometry),"Triángulos:",sum(len(g.faces) for g in scene.geometry.values()))
