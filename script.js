// 전체 사람 목록 가져오기
async function loadPeople() {
  const { data, error } = await supabaseClient
    .from("people")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  const peopleList = document.getElementById("peopleList");

  peopleList.innerHTML = "";

  const tiers = ["S", "A", "B"];

  tiers.forEach(function(tier) {
    const tierSection = document.createElement("div");
    tierSection.className = "tier-section";

    const title = document.createElement("h2");
    title.className = "tier-title tier-title-" + tier;
    title.innerHTML = "● " + tier + " TIER";

    tierSection.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "people-grid";

    const tierPeople = data.filter(function(person) {
      return person.tier === tier;
    });

    if (tierPeople.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-tier";
      empty.textContent = "아직 사람이 없습니다.";
      grid.appendChild(empty);
    } else {
      tierPeople.forEach(function(person) {
        grid.appendChild(createPersonCard(person));
      });
    }

    tierSection.appendChild(grid);
    peopleList.appendChild(tierSection);
  });
}


// 사람 카드 만들기
function createPersonCard(person) {
  const card = document.createElement("div");
  card.className = "person";

  // 프로필 사진
  const image = document.createElement("img");

  if (person.profile_image) {
    image.src = person.profile_image;
  } else {
    image.src =
      "https://ui-avatars.com/api/?name=" +
      encodeURIComponent(person.name) +
      "&background=334155&color=ffffff&size=160";
  }

  image.alt = person.name;

  image.style.width = "70px";
  image.style.height = "70px";
  image.style.borderRadius = "50%";
  image.style.objectFit = "cover";
  image.style.marginBottom = "8px";

  card.appendChild(image);


  // 이름
  const name = document.createElement("div");
  name.className = "person-name";
  name.textContent = person.name;

  name.style.textAlign = "center";
  name.style.width = "100%";

  card.appendChild(name);


  // 별명
  if (person.nickname) {
    const nickname = document.createElement("div");

    nickname.textContent = "@" + person.nickname;

    nickname.style.fontSize = "13px";
    nickname.style.color = "#94a3b8";
    nickname.style.marginTop = "3px";

    card.appendChild(nickname);
  }


  // 한줄 소개
  if (person.description) {
    const description = document.createElement("div");

    description.textContent = person.description;

    description.style.fontSize = "12px";
    description.style.color = "#cbd5e1";
    description.style.marginTop = "5px";
    description.style.textAlign = "center";

    card.appendChild(description);
  }

  return card;
}


// 사람 검색
async function searchPerson() {
  const searchInput = document.getElementById("searchInput");
  const result = document.getElementById("result");

  const name = searchInput.value.trim();

  if (!name) {
    result.innerHTML = "";
    return;
  }

  const { data, error } = await supabaseClient
    .from("people")
    .select("*")
    .ilike("name", "%" + name + "%");

  if (error) {
    console.error(error);
    result.innerHTML = "오류가 발생했습니다.";
    return;
  }

  if (data.length === 0) {
    result.innerHTML =
      '<div class="no-result">없음</div>';
    return;
  }

  result.innerHTML = data.map(function(person) {
    return (
      '<div class="person">' +
        '<span>' + person.name + '</span>' +
        '<span class="tier tier-' + person.tier + '">' +
          person.tier +
        '</span>' +
      '</div>'
    );
  }).join("");
}


// 사람 추가
async function addPerson() {
  const nameInput = document.getElementById("nameInput");
  const tierInput = document.getElementById("tierInput");

  const name = nameInput.value.trim();
  const tier = tierInput.value;

  if (!name) {
    alert("사람 이름을 입력해주세요.");
    return;
  }

  const { error } = await supabaseClient
    .from("people")
    .insert([
      {
        name: name,
        tier: tier,
        nickname: "",
        profile_image: "",
        description: ""
      }
    ]);

  if (error) {
    console.error(error);
    alert("추가에 실패했습니다.");
    return;
  }

alert("사람이 추가되었습니다.");

nameInput.value = "";

loadPeople();
loadProfiles();
}


// 프로필 수정창
function openEditModal(person) {

  // 기존 창 제거
  const oldModal = document.getElementById("profileEditModal");

  if (oldModal) {
    oldModal.remove();
  }


  const modal = document.createElement("div");

  modal.id = "profileEditModal";

  modal.style.position = "fixed";
  modal.style.left = "0";
  modal.style.top = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.background = "rgba(0,0,0,0.7)";
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.zIndex = "9999";


  const box = document.createElement("div");

  box.style.width = "min(450px, 90%)";
  box.style.background = "#1e293b";
  box.style.borderRadius = "18px";
  box.style.padding = "25px";
  box.style.color = "white";
  box.style.boxShadow = "0 20px 50px rgba(0,0,0,0.4)";


  const title = document.createElement("h2");

  title.textContent = "프로필 수정";

  title.style.textAlign = "center";
  title.style.marginTop = "0";

  box.appendChild(title);


  // 사진 미리보기
  const preview = document.createElement("img");

  if (person.profile_image) {
    preview.src = person.profile_image;
  } else {
    preview.src =
      "https://ui-avatars.com/api/?name=" +
      encodeURIComponent(person.name) +
      "&background=334155&color=ffffff&size=160";
  }

  preview.style.display = "block";
  preview.style.width = "100px";
  preview.style.height = "100px";
  preview.style.objectFit = "cover";
  preview.style.borderRadius = "50%";
  preview.style.margin = "10px auto 15px";

  box.appendChild(preview);


  // 사진 선택
  const imageInput = document.createElement("input");

  imageInput.type = "file";
  imageInput.accept = "image/*";

  imageInput.style.display = "block";
  imageInput.style.margin = "0 auto 20px";

  box.appendChild(imageInput);


  imageInput.onchange = function() {
    const file = imageInput.files[0];

    if (!file) {
      return;
    }

    preview.src = URL.createObjectURL(file);
  };


  // 이름
  const nameLabel = document.createElement("div");

  nameLabel.textContent = "이름";

  nameLabel.style.marginBottom = "5px";

  box.appendChild(nameLabel);


  const nameInput = document.createElement("input");

  nameInput.type = "text";
  nameInput.value = person.name;

  nameInput.style.width = "100%";
  nameInput.style.height = "42px";
  nameInput.style.padding = "0 12px";
  nameInput.style.marginBottom = "15px";
  nameInput.style.borderRadius = "8px";
  nameInput.style.border = "1px solid #475569";
  nameInput.style.boxSizing = "border-box";

  box.appendChild(nameInput);


  // 별명
  const nicknameLabel = document.createElement("div");

  nicknameLabel.textContent = "별명";

  nicknameLabel.style.marginBottom = "5px";

  box.appendChild(nicknameLabel);


  const nicknameInput = document.createElement("input");

  nicknameInput.type = "text";
  nicknameInput.value = person.nickname || "";
  nicknameInput.placeholder = "별명을 입력하세요";

  nicknameInput.style.width = "100%";
  nicknameInput.style.height = "42px";
  nicknameInput.style.padding = "0 12px";
  nicknameInput.style.marginBottom = "15px";
  nicknameInput.style.borderRadius = "8px";
  nicknameInput.style.border = "1px solid #475569";
  nicknameInput.style.boxSizing = "border-box";

  box.appendChild(nicknameInput);


  // 한줄 소개
  const descriptionLabel = document.createElement("div");

  descriptionLabel.textContent = "한줄 소개";

  descriptionLabel.style.marginBottom = "5px";

  box.appendChild(descriptionLabel);


  const descriptionInput = document.createElement("input");

  descriptionInput.type = "text";
  descriptionInput.value = person.description || "";
  descriptionInput.placeholder = "한줄 소개를 입력하세요";

  descriptionInput.style.width = "100%";
  descriptionInput.style.height = "42px";
  descriptionInput.style.padding = "0 12px";
  descriptionInput.style.marginBottom = "15px";
  descriptionInput.style.borderRadius = "8px";
  descriptionInput.style.border = "1px solid #475569";
  descriptionInput.style.boxSizing = "border-box";

  box.appendChild(descriptionInput);


  // 티어
  const tierLabel = document.createElement("div");

  tierLabel.textContent = "티어";

  tierLabel.style.marginBottom = "5px";

  box.appendChild(tierLabel);


  const tierSelect = document.createElement("select");

  ["S", "A", "B"].forEach(function(tier) {

    const option = document.createElement("option");

    option.value = tier;
    option.textContent = tier + " TIER";

    if (tier === person.tier) {
      option.selected = true;
    }

    tierSelect.appendChild(option);
  });


  tierSelect.style.width = "100%";
  tierSelect.style.height = "42px";
  tierSelect.style.marginBottom = "20px";
  tierSelect.style.borderRadius = "8px";

  box.appendChild(tierSelect);


  // 버튼 영역
  const buttons = document.createElement("div");

  buttons.style.display = "flex";
  buttons.style.gap = "7px";
  buttons.style.flexWrap = "wrap";
  buttons.style.justifyContent = "center";


  // 저장
  const saveButton = document.createElement("button");

  saveButton.textContent = "저장";

  saveButton.style.background = "#2563eb";
  saveButton.style.color = "white";
  saveButton.style.border = "0";
  saveButton.style.borderRadius = "8px";
  saveButton.style.padding = "10px 18px";
  saveButton.style.cursor = "pointer";

  saveButton.onclick = function() {
    saveProfile(
      person,
      nameInput.value.trim(),
      nicknameInput.value.trim(),
      descriptionInput.value.trim(),
      tierSelect.value,
      imageInput.files[0],
      modal
    );
  };

  buttons.appendChild(saveButton);


  // 닫기
  const closeButton = document.createElement("button");

  closeButton.textContent = "닫기";

  closeButton.style.background = "#475569";
  closeButton.style.color = "white";
  closeButton.style.border = "0";
  closeButton.style.borderRadius = "8px";
  closeButton.style.padding = "10px 18px";
  closeButton.style.cursor = "pointer";

  closeButton.onclick = function() {
    modal.remove();
  };

  buttons.appendChild(closeButton);


  // 삭제
  const deleteButton = document.createElement("button");

  deleteButton.textContent = "삭제";

  deleteButton.style.background = "#991b1b";
  deleteButton.style.color = "white";
  deleteButton.style.border = "0";
  deleteButton.style.borderRadius = "8px";
  deleteButton.style.padding = "10px 18px";
  deleteButton.style.cursor = "pointer";

  deleteButton.onclick = function() {
    deletePerson(person.id, modal);
  };

  buttons.appendChild(deleteButton);


  box.appendChild(buttons);

  modal.appendChild(box);

  document.body.appendChild(modal);
}


// 프로필 저장
async function saveProfile(
  person,
  name,
  nickname,
  description,
  tier,
  imageFile,
  modal
) {

  if (!name) {
    alert("이름을 입력해주세요.");
    return;
  }


  let profileImage = person.profile_image || "";


  // 새 사진이 선택된 경우
  if (imageFile) {

    const fileExt =
      imageFile.name.split(".").pop();

    const fileName =
      person.id +
      "_" +
      Date.now() +
      "." +
      fileExt;


    const filePath =
      "profiles/" + fileName;


    const { error: uploadError } =
      await supabaseClient
        .storage
        .from("profiles")
        .upload(filePath, imageFile, {
          upsert: true
        });


    if (uploadError) {
      console.error(uploadError);

      alert(
        "사진 업로드에 실패했습니다.\n" +
        "Supabase Storage의 profiles 버킷을 확인해주세요."
      );

      return;
    }


    const { data: publicData } =
      supabaseClient
        .storage
        .from("profiles")
        .getPublicUrl(filePath);


    profileImage =
      publicData.publicUrl;
  }


  // DB 수정
  const { error } = await supabaseClient
    .from("people")
    .update({
      name: name,
      nickname: nickname,
      description: description,
      tier: tier,
      profile_image: profileImage
    })
    .eq("id", person.id);


  if (error) {
    console.error(error);

    alert("프로필 수정에 실패했습니다.");

    return;
  }


  alert("프로필이 수정되었습니다.");

  modal.remove();

  loadPeople();
}


// 사람 삭제
async function deletePerson(id, modal) {

  const confirmed =
    confirm("정말 이 사람을 삭제하시겠습니까?");

  if (!confirmed) {
    return;
  }


  const { error } = await supabaseClient
    .from("people")
    .delete()
    .eq("id", id);


  if (error) {
    console.error(error);

    alert("삭제에 실패했습니다.");

    return;
  }


  alert("삭제되었습니다.");

  modal.remove();

  loadPeople();
}

// 프로필 목록

async function loadProfiles() {

  const profileList = document.getElementById("profileList");

  if (!profileList) return;

  profileList.innerHTML = "";

  const { data, error } = await supabaseClient
    .from("people")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    profileList.innerHTML = "<p>프로필을 불러오지 못했습니다.</p>";
    return;
  }

  if (!data || data.length === 0) {
    profileList.innerHTML =
      "<p class='profile-empty'>등록된 프로필이 없습니다.</p>";
    return;
  }

  data.forEach(function(person) {

    const card = document.createElement("div");
    card.className = "profile-card";

    // 프로필 사진
    const image = document.createElement("img");

    if (person.profile_image) {
      image.src = person.profile_image;
    } else {
      image.src =
        "https://ui-avatars.com/api/?name=" +
        encodeURIComponent(person.name) +
        "&background=334155&color=ffffff&size=200";
    }

    image.alt = person.name;
    image.className = "profile-image";

    card.appendChild(image);


    // 이름
    const name = document.createElement("h2");
    name.textContent = person.name;
    name.className = "profile-name";

    card.appendChild(name);


    // 닉네임
    if (person.nickname) {

      const nickname = document.createElement("div");

      nickname.textContent = "@" + person.nickname;
      nickname.className = "profile-nickname";

      card.appendChild(nickname);
    }


    // 자기소개
    if (person.description) {

      const description = document.createElement("p");

      description.textContent = person.description;
      description.className = "profile-description";

      card.appendChild(description);
    }


    // 티어
    const tier = document.createElement("div");

    tier.textContent = person.tier;
    tier.className = "profile-tier tier-" + person.tier;

    card.appendChild(tier);


    // 수정 버튼
    const editButton = document.createElement("button");

    editButton.textContent = "프로필 수정";
    editButton.className = "profile-edit-button";

    editButton.onclick = function() {
      openEditModal(person);
    };

    card.appendChild(editButton);


    profileList.appendChild(card);
  });
}

// 페이지가 열리면 전체 목록 표시
loadPeople();
